/**
 * useVoiceSession (Socket.IO)
 * Real-time voice session for ONE chatbot in this browser tab.
 * Uses persistent socket connection for low-latency turns.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getVoiceSocket, socketEmitAck } from '../socket/voiceSocket';
import { blobToBase64 } from '../utils/audioEncode';
import { playVoiceAudio } from '../utils/audioPlayback';

function createBrowserSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `vs_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function useVoiceSession(chatbotId) {
  const [isReady, setIsReady] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [voiceStage, setVoiceStage] = useState('connecting'); // connecting | ready | transcribing | speaking
  const [error, setError] = useState('');

  const sessionIdRef = useRef(null);
  const cleanupAudioRef = useRef(null);
  const socketRef = useRef(null);

  // Connect socket and start isolated session when chatbot page opens
  useEffect(() => {
    if (!chatbotId) return undefined;

    let cancelled = false;
    const localSessionId = createBrowserSessionId();
    sessionIdRef.current = localSessionId;

    const socket = getVoiceSocket();
    socketRef.current = socket;

    const onStatus = ({ stage }) => {
      if (stage === 'transcribing') setVoiceStage('transcribing');
      if (stage === 'speaking') setVoiceStage('speaking');
    };

    socket.on('voice:status', onStatus);

    (async () => {
      try {
        setVoiceStage('connecting');
        const response = await socketEmitAck('voice:session:start', {
          chatbotId,
          sessionId: localSessionId,
        });

        if (cancelled) return;

        const data = response.data;
        sessionIdRef.current = data.sessionId;
        setIsActivated(Boolean(data.isActivated));
        setIsReady(true);
        setVoiceStage('ready');
        console.log(`[Voice] Session ready for bot "${data.chatbotName}" (${data.sessionId})`);
        console.log('[Voice] ✅ Tap the image → speak → tap again to send');
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Could not connect voice session');
        setVoiceStage('error');
        console.error('[Voice] Session start failed:', err.message);
      }
    })();

    return () => {
      cancelled = true;
      socket.off('voice:status', onStatus);

      if (cleanupAudioRef.current) {
        cleanupAudioRef.current();
        cleanupAudioRef.current = null;
      }

      // Delay session end so React Strict Mode remount does not kill the new session
      const sid = sessionIdRef.current;
      const bid = chatbotId;
      window.setTimeout(() => {
        if (sessionIdRef.current !== sid) return;
        if (sid && bid) {
          socket.emit('voice:session:end', { chatbotId: bid, sessionId: sid });
        }
      }, 150);
    };
  }, [chatbotId]);

  /** Send recorded audio over socket → play male voice reply */
  const processRecording = useCallback(
    async (audioBlob) => {
      if (!chatbotId || !sessionIdRef.current || !audioBlob) {
        console.warn('[Voice] processRecording skipped — missing data');
        return;
      }
      if (isBusy) return;

      setIsBusy(true);
      setError('');
      setVoiceStage('transcribing');
      console.log(`[Voice] Sending audio (${audioBlob.size} bytes) to server…`);

      try {
        const audioBase64 = await blobToBase64(audioBlob);
        const mimeType = audioBlob.type || 'audio/webm';

        const response = await socketEmitAck('voice:turn', {
          chatbotId,
          sessionId: sessionIdRef.current,
          audioBase64,
          mimeType,
        });

        const data = response.data;
        setIsActivated(Boolean(data.isActivated));

        // Debug logs — what user spoke and what Gemini returned
        console.log('\n────────── Voice turn (frontend) ──────────');
        console.log(`[Voice] Bot: ${data.chatbotName || chatbotId}`);
        console.log(`[Voice] You said: "${data.transcript || '(no speech)'}"`);
        console.log(`[Voice] Gemini replied: "${data.replyText || ''}"`);
        console.log(`[Voice] Activated: ${Boolean(data.isActivated)}`);
        console.log('──────────────────────────────────────────\n');

        if (cleanupAudioRef.current) {
          cleanupAudioRef.current();
          cleanupAudioRef.current = null;
        }

        if (data.audioBase64) {
          setVoiceStage('speaking');
          const { stop, done } = playVoiceAudio(data.audioBase64, data.audioMimeType);
          cleanupAudioRef.current = stop;
          await done;
          cleanupAudioRef.current = null;
        }

        setVoiceStage('ready');
      } catch (err) {
        setVoiceStage('ready');
        const shortMsg = err.message?.includes('quota')
          ? 'Gemini API quota exceeded — try another API key or wait a few minutes.'
          : err.message || 'Voice turn failed';
        console.error('[Voice] Turn failed:', shortMsg);
      } finally {
        setIsBusy(false);
      }
    },
    [chatbotId, isBusy]
  );

  return {
    isReady,
    isActivated,
    isBusy,
    voiceStage,
    error,
    processRecording,
  };
}
