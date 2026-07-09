/**
 * Gemini Live — session auto-connects; user taps once to enable mic (browser requirement).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { getVoiceSocket, socketEmitAck, waitForSocketConnection } from '../socket/voiceSocket';
import { startPcmMicStream } from '../utils/pcmAudio';
import { playLiveAudioChunk, stopLivePlayback } from '../utils/liveAudioPlayback';
import { resolveAssetUrl } from '../../utils/mapChatbot';

export function useGeminiLive(chatbotId) {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [stage, setStage] = useState('connecting');
  const [error, setError] = useState('');
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [carouselHoldMs, setCarouselHoldMs] = useState(5000);
  const [activePdfName, setActivePdfName] = useState('');
  const [leadForm, setLeadForm] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [activationKey, setActivationKey] = useState('');
  const [needsMicTap, setNeedsMicTap] = useState(true);

  const stopMicRef = useRef(null);
  const socketRef = useRef(null);
  const startingRef = useRef(false);
  const sessionStartedRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isActivatedRef = useRef(false);
  const isListeningRef = useRef(false);
  const chatbotIdRef = useRef(chatbotId);
  const wantMicRef = useRef(false);

  chatbotIdRef.current = chatbotId;

  const startMic = useCallback(async () => {
    if (!socketRef.current || isListeningRef.current) return true;

    try {
      wantMicRef.current = true;
      setNeedsMicTap(false);
      socketRef.current.emit('live:mic_on');

      const stop = await startPcmMicStream(
        (base64) => {
          socketRef.current?.emit('live:audio', {
            data: base64,
            mimeType: 'audio/pcm;rate=16000',
          });
        },
        {
          isBotSpeakingRef: isSpeakingRef,
          isActivatedRef,
          onBargeIn: () => {
            stopLivePlayback();
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            socketRef.current?.emit('live:interrupt');
          },
          onSpeechEnd: () => {
            socketRef.current?.emit('live:audio_end');
          },
        }
      );

      stopMicRef.current = stop;
      isListeningRef.current = true;
      setIsListening(true);
      setError('');
      console.log('[Live] Microphone on — say hello or your activation keyword');
      return true;
    } catch (err) {
      const msg = err.message || 'Microphone permission denied';
      setError(msg);
      setNeedsMicTap(true);
      wantMicRef.current = false;
      console.error('[Live] Mic error:', msg);
      return false;
    }
  }, []);

  const stopMic = useCallback(() => {
    wantMicRef.current = false;
    if (stopMicRef.current) {
      stopMicRef.current();
      stopMicRef.current = null;
    }
    socketRef.current?.emit('live:mic_off');
    socketRef.current?.emit('live:audio_end');
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const startLiveSession = useCallback(async () => {
    const id = chatbotIdRef.current;
    if (!id || startingRef.current) return false;

    startingRef.current = true;
    setStage('connecting');
    setError('');

    try {
      await waitForSocketConnection();
      const socket = socketRef.current || getVoiceSocket();

      const response = await socketEmitAck('live:start', { chatbotId: id });

      sessionStartedRef.current = true;
      setSessionStarted(true);
      setIsReady(true);
      setStage('ready');
      if (response.data?.activationKey) setActivationKey(response.data.activationKey);
      console.log(`[Live] Session started — model: ${response.data?.model}`);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to start');
      setStage('error');
      sessionStartedRef.current = false;
      setSessionStarted(false);
      return false;
    } finally {
      startingRef.current = false;
    }
  }, []);

  // Socket events + reconnect handling
  useEffect(() => {
    if (!chatbotId) return undefined;

    const socket = getVoiceSocket();
    socketRef.current = socket;

    const onLiveEvent = (payload) => {
      if (!payload?.type) return;

      switch (payload.type) {
        case 'ready':
          setIsReady(true);
          setStage('ready');
          if (payload.activationKey) setActivationKey(payload.activationKey);
          console.log('[Live] Ready — tap screen then say hello or activation keyword');
          break;
        case 'activated':
          isActivatedRef.current = true;
          setIsActivated(true);
          console.log('[Live] Bot activated');
          break;
        case 'images': {
          const list = (payload.images || []).map((img) => ({
            ...img,
            url: resolveAssetUrl(img.url),
          }));
          setSlides(list);
          setCurrentSlideIndex(0);
          setCarouselHoldMs(payload.holdCarouselMs ?? 5000);
          setActivePdfName(payload.pdfName || '');
          break;
        }
        case 'show_onboarding':
          setSlides([]);
          setCurrentSlideIndex(0);
          setActivePdfName('');
          break;
        case 'image_sync': {
          const slideIndex = payload.slideIndex;
          if (typeof slideIndex === 'number' && slideIndex >= 0) {
            setCurrentSlideIndex(slideIndex);
          } else if (payload.imageId) {
            setSlides((current) => {
              const idx = current.findIndex((s) => s.id === payload.imageId);
              if (idx >= 0) setCurrentSlideIndex(idx);
              else if (payload.imageId <= current.length) {
                setCurrentSlideIndex(payload.imageId - 1);
              }
              return current;
            });
          }
          break;
        }
        case 'show_lead_form':
          setLeadForm(payload.data || null);
          setShowLeadForm(true);
          break;
        case 'activate_camera':
          setShowCamera(true);
          break;
        case 'lead_saved':
          setLeadSaved(true);
          setShowLeadForm(false);
          setLeadForm(null);
          setSlides([]);
          setCurrentSlideIndex(0);
          setActivePdfName('');
          isActivatedRef.current = false;
          setIsActivated(false);
          setTimeout(() => setLeadSaved(false), 4000);
          if (!isListeningRef.current && wantMicRef.current) {
            startMic().catch(() => {});
          }
          break;
        case 'audio':
          if (!isActivatedRef.current) {
            isActivatedRef.current = true;
            setIsActivated(true);
          }
          isSpeakingRef.current = true;
          setIsSpeaking(true);
          playLiveAudioChunk(payload.data, payload.mimeType);
          break;
        case 'turn_complete':
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          break;
        case 'transcript':
          if (payload.final) {
            if (payload.role === 'user') {
              console.log(`[Live] You said: "${payload.text}"`);
            } else if (payload.role === 'assistant') {
              console.log(`[Live] Bot said: "${payload.text}"`);
            }
          }
          break;
        case 'error':
          setError(payload.message);
          setStage('error');
          break;
        case 'interrupted':
          stopLivePlayback();
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          break;
        default:
          break;
      }
    };

    const onSocketConnect = () => {
      console.log('[Live] Socket connected — starting session…');
      startLiveSession().then((ok) => {
        if (ok && wantMicRef.current && !isListeningRef.current) {
          startMic().catch(() => setNeedsMicTap(true));
        }
      });
    };

    socket.on('live:event', onLiveEvent);
    socket.on('connect', onSocketConnect);

    // Initial boot
    startLiveSession().then((ok) => {
      if (ok) console.log('[Live] Tap the screen to enable microphone');
    });

    return () => {
      socket.off('live:event', onLiveEvent);
      socket.off('connect', onSocketConnect);
      stopMic();
      stopLivePlayback();

      if (sessionStartedRef.current) {
        socket.emit('live:stop');
        sessionStartedRef.current = false;
      }

      setSessionStarted(false);
      setIsReady(false);
      setIsActivated(false);
      setIsListening(false);
      setIsSpeaking(false);
    };
  }, [chatbotId, startLiveSession, startMic, stopMic]);

  const enableVoice = useCallback(async () => {
    if (!sessionStartedRef.current) {
      const ok = await startLiveSession();
      if (!ok) return;
    }
    await startMic();
  }, [startLiveSession, startMic]);

  const closeCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  return {
    sessionStarted,
    isReady,
    isActivated,
    isListening,
    isSpeaking,
    stage,
    error,
    slides,
    currentSlideIndex,
    carouselHoldMs,
    activePdfName,
    leadForm,
    showLeadForm,
    showCamera,
    leadSaved,
    activationKey,
    needsMicTap,
    enableVoice,
    closeCamera,
  };
}
