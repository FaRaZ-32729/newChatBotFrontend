/**
 * Microphone → PCM 16kHz mono for Gemini Live.
 *
 * Batches audio into ~200–250ms packets before socket emit so the
 * frontend→backend path is not flooded with tiny chunks (was ~60ms).
 *
 * Wake (not activated): one clear phrase, then live:wake.
 * Active chat: stream speech + silence (Gemini VAD needs silence).
 * While bot speaks: mute uplink unless strong barge-in.
 */

const TARGET_SAMPLE_RATE = 16000;
/** ~200ms of 16kHz audio per socket packet (was 960 ≈ 60ms — too chatty). */
const BATCH_SAMPLES = 3200;
/** Flush leftover buffer at least this often (ms). */
const FLUSH_INTERVAL_MS = 100;
/** Never hold more than ~300ms before sending. */
const MAX_BUFFER_SAMPLES = 4800;
const SPEECH_LEVEL = 0.014;
const MIN_SPEECH_FRAMES = 40;
const SILENCE_END_FRAMES = 70;
const TURN_COOLDOWN_MS = 2500;
const CONV_SPEECH_LEVEL = 0.018;
const CONV_MIN_SPEECH_FRAMES = 55;
const CONV_SILENCE_END_FRAMES = 85;
const POST_BOT_COOLDOWN_MS = 700;

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
      autoGainControl: false,
    },
  });

  const audioContext = new AudioContext();
  if (audioContext.state === 'suspended') await audioContext.resume();

  await audioContext.audioWorklet.addModule('/pcm-worklet-processor.js?v=12');

  const source = audioContext.createMediaStreamSource(stream);
  const worklet = new AudioWorkletNode(audioContext, 'pcm-worklet-processor');
  const sourceSampleRate = audioContext.sampleRate;

  let pendingFloat = [];
  let pendingSamples = 0;
  let loudFrameStreak = 0;
  let bargeInActive = false;
  let bargeInFired = false;
  let botWasSpeaking = false;
  let speakingStartedAt = 0;
  let botStoppedAt = 0;

  // Wake mode
  let inSpeech = false;
  let speechFrames = 0;
  let silenceFrames = 0;
  let lastTurnEndAt = 0;

  // Active conversation turn detection
  let convInSpeech = false;
  let convSpeechFrames = 0;
  let convSilenceFrames = 0;

  // Sensitive barge-in: user must be able to cut the bot mid-answer
  const BARGE_SPEECH_THRESHOLD = 0.026;
  const BARGE_LISTEN_THRESHOLD = 0.018;
  const BARGE_IN_FRAMES = 22;
  const BARGE_STREAM_FRAMES = 10;
  const BARGE_IN_GRACE_MS = 280;

  const flushBatch = () => {
    if (!pendingSamples) return;
    const merged = concatFloat32(pendingFloat);
    pendingFloat = [];
    pendingSamples = 0;
    onChunk(bytesToBase64(floatTo16BitPCM(merged)));
  };

  const pushFrame = (resampled) => {
    pendingFloat.push(resampled);
    pendingSamples += resampled.length;
    if (pendingSamples >= BATCH_SAMPLES || pendingSamples >= MAX_BUFFER_SAMPLES) {
      flushBatch();
    }
  };

  const commitWakeTurn = () => {
    inSpeech = false;
    speechFrames = 0;
    silenceFrames = 0;
    lastTurnEndAt = Date.now();
    flushBatch();
    onSpeechEnd?.();
    console.log('[Mic] Wake turn committed');
  };

  const commitConversationTurn = () => {
    convInSpeech = false;
    convSpeechFrames = 0;
    convSilenceFrames = 0;
    lastTurnEndAt = Date.now();
    flushBatch();
    onSpeechEnd?.();
    console.log('[Mic] User pause (debug only — Gemini VAD replies)');
  };

  worklet.port.onmessage = (event) => {
    const input = event.data;
    if (!input?.length) return;

    const resampled = resampleTo16k(input, sourceSampleRate);
    const rms = computeRms(resampled);
    const botSpeaking = Boolean(isBotSpeakingRef?.current);
    const activated = Boolean(isActivatedRef?.current);

    if (botSpeaking && !botWasSpeaking) {
      speakingStartedAt = Date.now();
      loudFrameStreak = 0;
      bargeInActive = false;
      bargeInFired = false;
      convInSpeech = false;
      convSpeechFrames = 0;
      convSilenceFrames = 0;
    }
    if (!botSpeaking && botWasSpeaking) {
      loudFrameStreak = 0;
      bargeInActive = false;
      bargeInFired = false;
      botStoppedAt = Date.now();
      convInSpeech = false;
      convSpeechFrames = 0;
      convSilenceFrames = 0;
    }
    botWasSpeaking = botSpeaking;

    // ——— Wake mode (not activated yet) ———
    if (!activated) {
      const inCooldown = Date.now() - lastTurnEndAt < TURN_COOLDOWN_MS;

      if (rms >= SPEECH_LEVEL) {
        if (inCooldown) return;
        inSpeech = true;
        speechFrames += 1;
        silenceFrames = 0;
        pushFrame(resampled);
        return;
      }

      if (inSpeech && !inCooldown) {
        silenceFrames += 1;
        pushFrame(resampled);
        if (speechFrames >= MIN_SPEECH_FRAMES && silenceFrames >= SILENCE_END_FRAMES) {
          commitWakeTurn();
        }
      }
      return;
    }

    // ——— Bot speaking: allow barge-in so Gemini hears the user mid-answer ———
    if (botSpeaking) {
      if (Date.now() - speakingStartedAt < BARGE_IN_GRACE_MS) return;

      if (rms >= BARGE_SPEECH_THRESHOLD) loudFrameStreak += 1;
      else if (rms >= BARGE_LISTEN_THRESHOLD) loudFrameStreak += 1;
      else loudFrameStreak = Math.max(0, loudFrameStreak - 2);

      if (!bargeInActive && loudFrameStreak >= BARGE_IN_FRAMES) {
        bargeInActive = true;
        if (!bargeInFired) {
          bargeInFired = true;
          onBargeIn?.();
        }
      }

      if (loudFrameStreak >= BARGE_STREAM_FRAMES || bargeInActive) {
        pushFrame(resampled);
      }
      return;
    }

    // ——— Active chat: stream continuously; Gemini VAD ends turns ———
    const postBotCooldown = Date.now() - botStoppedAt < POST_BOT_COOLDOWN_MS;
    const inCooldown = Date.now() - lastTurnEndAt < 700 || postBotCooldown;

    if (rms >= CONV_SPEECH_LEVEL) {
      if (!inCooldown) {
        if (!convInSpeech) {
          convInSpeech = true;
          convSpeechFrames = 0;
          convSilenceFrames = 0;
        }
        convSpeechFrames += 1;
        convSilenceFrames = 0;
      }
      pushFrame(resampled);
      return;
    }

    pushFrame(resampled);

    if (convInSpeech && !inCooldown) {
      convSilenceFrames += 1;
      if (
        convSpeechFrames >= CONV_MIN_SPEECH_FRAMES
        && convSilenceFrames >= CONV_SILENCE_END_FRAMES
      ) {
        commitConversationTurn();
      }
    }
  };

  // Timed flush — only when leftover is meaningful (≥ ~100ms)
  const flushTimer = setInterval(() => {
    if (pendingSamples >= Math.floor(BATCH_SAMPLES / 2)) {
      flushBatch();
    }
  }, FLUSH_INTERVAL_MS);

  source.connect(worklet);
  const silentGain = audioContext.createGain();
  silentGain.gain.value = 0;
  worklet.connect(silentGain);
  silentGain.connect(audioContext.destination);

  console.log(
    `[Mic] Ready — batched uplink ~${Math.round((BATCH_SAMPLES / TARGET_SAMPLE_RATE) * 1000)}ms packets`
  );

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
