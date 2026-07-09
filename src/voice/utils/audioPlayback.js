/**
 * Helpers to play Gemini TTS audio in the browser.
 * Gemini often returns raw PCM (L16). Browsers cannot play that directly,
 * so we wrap PCM into a tiny WAV header first.
 */

export function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function pcmToWavBlob(pcmBytes, sampleRate = 24000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmBytes.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  new Uint8Array(buffer, 44).set(pcmBytes);
  return new Blob([buffer], { type: 'audio/wav' });
}

export function getSampleRateFromMime(mimeType) {
  if (!mimeType) return 24000;
  const match = String(mimeType).match(/rate=(\d+)/i);
  return match ? Number(match[1]) : 24000;
}

export function buildPlayableAudioUrl(audioBase64, mimeType) {
  if (!audioBase64) return null;

  const bytes = base64ToBytes(audioBase64);
  const mime = String(mimeType || '').toLowerCase();

  if (mime.includes('l16') || mime.includes('pcm') || mime.includes('audio/l16')) {
    const rate = getSampleRateFromMime(mimeType);
    return URL.createObjectURL(pcmToWavBlob(bytes, rate));
  }

  return URL.createObjectURL(new Blob([bytes], { type: mimeType || 'audio/wav' }));
}

/**
 * Play Gemini audio.
 * Returns { stop, done } so the UI can cut off speech if the user talks again.
 */
export function playVoiceAudio(audioBase64, mimeType) {
  const url = buildPlayableAudioUrl(audioBase64, mimeType);
  if (!url) {
    return {
      stop: () => {},
      done: Promise.resolve(),
    };
  }

  const audio = new Audio(url);
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    try {
      audio.pause();
      audio.src = '';
    } catch {
      /* ignore */
    }
    URL.revokeObjectURL(url);
  };

  const done = new Promise((resolve) => {
    audio.onended = () => {
      stop();
      resolve();
    };
    audio.onerror = () => {
      stop();
      resolve();
    };
    audio.play().catch(() => {
      stop();
      resolve();
    });
  });

  return { stop, done };
}
