/**
 * Play PCM audio chunks from Gemini Live — supports instant interrupt.
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
  const pcmData = bytes;

  if (mime.includes('l16') || mime.includes('pcm')) {
    sampleRate = getSampleRateFromMime(mimeType);
  }

  const int16 = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength / 2);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i += 1) {
    float32[i] = int16[i] / 32768;
  }

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
  const startAt = Math.max(now, nextPlayTime);
  source.start(startAt);
  nextPlayTime = startAt + buffer.duration;
}

/** Stop all queued bot audio immediately (barge-in / interrupt). */
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
  nextPlayTime = 0;

  if (playbackContext && playbackContext.state !== 'closed') {
    playbackContext.close().catch(() => {});
  }
  playbackContext = null;
}
