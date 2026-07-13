/**
 * Play PCM audio chunks from Gemini Live — seamless queue, instant interrupt.
 * Keeps one AudioContext alive so speech does not cut between chunks.
 */
let playbackContext = null;
let nextPlayTime = 0;
let activeSources = [];

function getPlaybackContext() {
  if (!playbackContext || playbackContext.state === 'closed') {
    playbackContext = new AudioContext({ sampleRate: 24000 });
    nextPlayTime = 0;
    activeSources = [];
  }
  if (playbackContext.state === 'suspended') {
    playbackContext.resume().catch(() => {});
  }
  return playbackContext;
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getSampleRateFromMime(mimeType) {
  const match = String(mimeType || '').match(/rate=(\d+)/i);
  return match ? Number(match[1]) : 24000;
}

export function playLiveAudioChunk(base64, mimeType) {
  if (!base64) return;

  const ctx = getPlaybackContext();
  const bytes = base64ToBytes(base64);
  const mime = String(mimeType || '').toLowerCase();

  let sampleRate = 24000;
  if (mime.includes('l16') || mime.includes('pcm')) {
    sampleRate = getSampleRateFromMime(mimeType);
  }

  // Copy into aligned buffer — avoids Int16Array offset issues on odd byteOffset
  const aligned = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(aligned).set(bytes);
  const int16 = new Int16Array(aligned);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i += 1) {
    float32[i] = int16[i] / 32768;
  }

  if (!float32.length) return;

  const buffer = ctx.createBuffer(1, float32.length, sampleRate);
  buffer.copyToChannel(float32, 0);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);

  activeSources.push(source);
  source.onended = () => {
    activeSources = activeSources.filter((s) => s !== source);
  };

  const now = ctx.currentTime;
  // Small lookahead so late network chunks still schedule without gaps/clicks
  const startAt = Math.max(now + 0.035, nextPlayTime);
  try {
    source.start(startAt);
    nextPlayTime = startAt + buffer.duration;
  } catch (err) {
    console.warn('[Audio] schedule failed:', err.message);
    activeSources = activeSources.filter((s) => s !== source);
  }
}

/** True while bot audio is still queued or playing. */
export function isPlaybackBusy() {
  if (!playbackContext || playbackContext.state === 'closed') {
    return activeSources.length > 0;
  }
  return activeSources.length > 0 || nextPlayTime > playbackContext.currentTime + 0.05;
}

/**
 * Wait until speakers finish after turn_complete — keeps mic muted so echo
 * does not cut the answer mid-playback.
 */
export function whenPlaybackIdle(onIdle, { pollMs = 50, cushionMs = 320 } = {}) {
  let cancelled = false;
  let timer = null;

  const finish = () => {
    if (cancelled) return;
    timer = setTimeout(() => {
      if (!cancelled) onIdle?.();
    }, cushionMs);
  };

  const tick = () => {
    if (cancelled) return;
    if (isPlaybackBusy()) {
      timer = setTimeout(tick, pollMs);
      return;
    }
    finish();
  };

  tick();

  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };
}

/** Stop queued bot audio immediately (barge-in) — keep AudioContext alive. */
export function stopLivePlayback() {
  for (const source of activeSources) {
    try {
      source.stop();
      source.disconnect();
    } catch {
      /* already stopped */
    }
  }
  activeSources = [];

  if (playbackContext && playbackContext.state !== 'closed') {
    nextPlayTime = playbackContext.currentTime;
  } else {
    nextPlayTime = 0;
  }
}

/** Full teardown on session leave. */
export function disposeLivePlayback() {
  stopLivePlayback();
  if (playbackContext && playbackContext.state !== 'closed') {
    playbackContext.close().catch(() => {});
  }
  playbackContext = null;
  nextPlayTime = 0;
}
