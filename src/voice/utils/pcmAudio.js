/**
 * Microphone → PCM 16kHz mono → batched base64 for Gemini Live.
 * Wake mode: one clean speech turn, then single end-of-turn signal (debounced).
 */

const TARGET_SAMPLE_RATE = 16000;
const BATCH_SAMPLES = 960;
/** Must exceed this RMS to count as speech (ignores room hum) */
const SPEECH_LEVEL = 0.014;
/** ~300ms of speech before we allow end-of-turn */
const MIN_SPEECH_FRAMES = 50;
/** ~400ms silence after speech before committing turn */
const SILENCE_END_FRAMES = 100;
/** Ignore new turns for 3s after committing one */
const TURN_COOLDOWN_MS = 3000;

function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i += 1) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Uint8Array(buffer);
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function computeRms(float32Array) {
  if (!float32Array.length) return 0;
  let sum = 0;
  for (let i = 0; i < float32Array.length; i += 1) {
    sum += float32Array[i] * float32Array[i];
  }
  return Math.sqrt(sum / float32Array.length);
}

function resampleTo16k(float32Array, sourceSampleRate) {
  if (sourceSampleRate === TARGET_SAMPLE_RATE) return float32Array;

  const ratio = sourceSampleRate / TARGET_SAMPLE_RATE;
  const newLength = Math.max(1, Math.floor(float32Array.length / ratio));
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i += 1) {
    const srcIndex = i * ratio;
    const idx = Math.floor(srcIndex);
    const frac = srcIndex - idx;
    const a = float32Array[idx] ?? 0;
    const b = float32Array[Math.min(idx + 1, float32Array.length - 1)] ?? a;
    result[i] = a + frac * (b - a);
  }

  return result;
}

function concatFloat32(chunks) {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export async function startPcmMicStream(onChunk, options = {}) {
  const { isBotSpeakingRef, isActivatedRef, onBargeIn, onSpeechEnd } = options;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const audioContext = new AudioContext();
  if (audioContext.state === 'suspended') await audioContext.resume();

  await audioContext.audioWorklet.addModule('/pcm-worklet-processor.js?v=7');

  const source = audioContext.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(audioContext, 'pcm-worklet-processor');
  const sourceSampleRate = audioContext.sampleRate;

  let pendingFloat = [];
  let pendingSamples = 0;
  let loudFrameStreak = 0;
  let bargeInActive = false;
  let bargeInFired = false;

  // Wake turn state
  let inSpeech = false;
  let speechFrames = 0;
  let silenceFrames = 0;
  let lastTurnEndAt = 0;

  const NOISE_FLOOR = 0.008;
  const SPEECH_THRESHOLD = 0.022;
  const BARGE_IN_FRAMES = 14;

  const flushBatch = () => {
    if (!pendingSamples) return;
    const merged = concatFloat32(pendingFloat);
    pendingFloat = [];
    pendingSamples = 0;
    onChunk(bytesToBase64(floatTo16BitPCM(merged)));
  };

  const commitWakeTurn = () => {
    inSpeech = false;
    speechFrames = 0;
    silenceFrames = 0;
    lastTurnEndAt = Date.now();
    flushBatch();
    onSpeechEnd?.();
    console.log('[Mic] Wake turn committed (one shot)');
  };

  worklet.port.onmessage = (event) => {
    const input = event.data;
    if (!input?.length) return;

    const resampled = resampleTo16k(input, sourceSampleRate);
    const rms = computeRms(resampled);
    const botSpeaking = Boolean(isBotSpeakingRef?.current);
    const activated = Boolean(isActivatedRef?.current);

    if (!activated) {
      const inCooldown = Date.now() - lastTurnEndAt < TURN_COOLDOWN_MS;

      if (rms >= SPEECH_LEVEL) {
        if (inCooldown) return;

        inSpeech = true;
        speechFrames += 1;
        silenceFrames = 0;
        pendingFloat.push(resampled);
        pendingSamples += resampled.length;
        if (pendingSamples >= BATCH_SAMPLES) flushBatch();
        return;
      }

      if (inSpeech && !inCooldown) {
        silenceFrames += 1;
        pendingFloat.push(resampled);
        pendingSamples += resampled.length;
        if (pendingSamples >= BATCH_SAMPLES) flushBatch();

        if (
          speechFrames >= MIN_SPEECH_FRAMES
          && silenceFrames >= SILENCE_END_FRAMES
        ) {
          commitWakeTurn();
        }
      }
      return;
    }

    if (botSpeaking) {
      if (rms >= SPEECH_THRESHOLD) loudFrameStreak += 1;
      else loudFrameStreak = Math.max(0, loudFrameStreak - 1);

      if (!bargeInActive && loudFrameStreak >= BARGE_IN_FRAMES) {
        bargeInActive = true;
        if (!bargeInFired) {
          bargeInFired = true;
          onBargeIn?.();
        }
      }
      if (!bargeInActive) return;
    } else {
      loudFrameStreak = 0;
      bargeInActive = false;
      bargeInFired = false;
      if (rms < 0.003) return;
    }

    pendingFloat.push(resampled);
    pendingSamples += resampled.length;
    if (pendingSamples >= BATCH_SAMPLES) flushBatch();
  };

  const flushTimer = setInterval(() => {
    if (pendingSamples > 0) flushBatch();
  }, 60);

  source.connect(worklet);
  const silentGain = audioContext.createGain();
  silentGain.gain.value = 0;
  worklet.connect(silentGain);
  silentGain.connect(audioContext.destination);

  console.log('[Mic] Wake mode — one turn per phrase, 3s cooldown');

  return () => {
    clearInterval(flushTimer);
    flushBatch();
    try {
      worklet.disconnect();
      silentGain.disconnect();
      source.disconnect();
      stream.getTracks().forEach((t) => t.stop());
      audioContext.close();
    } catch {
      /* ignore */
    }
  };
}
