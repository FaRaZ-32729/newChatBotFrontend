/**
 * Voice API (HTTP fallback).
 * Primary real-time path is Socket.IO — see voice/socket/voiceSocket.js
 */
import { apiRequest } from './client';

export function startVoiceSessionApi(chatbotId, sessionId) {
  return apiRequest('/voice/session/start', {
    method: 'POST',
    body: { chatbotId, sessionId },
  });
}

export function endVoiceSessionApi(chatbotId, sessionId) {
  return apiRequest('/voice/session/end', {
    method: 'POST',
    body: { chatbotId, sessionId },
  });
}

export async function sendVoiceTurnApi({ chatbotId, sessionId, audioBlob }) {
  const formData = new FormData();
  formData.append('chatbotId', chatbotId);
  formData.append('sessionId', sessionId);
  formData.append('audio', audioBlob, 'speech.webm');

  return apiRequest('/voice/turn', {
    method: 'POST',
    body: formData,
  });
}
