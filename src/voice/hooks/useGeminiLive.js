/**
 * Gemini Live — session + mic auto-start; resilient socket + smooth playback.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getVoiceSocket,
  socketEmitAck,
  waitForSocketConnection,
  emitWhenConnected,
} from '../socket/voiceSocket';
import { startPcmMicStream } from '../utils/pcmAudio';
import {
  playLiveAudioChunk,
  stopLivePlayback,
  disposeLivePlayback,
  whenPlaybackIdle,
} from '../utils/liveAudioPlayback';
import { resolveAssetUrl } from '../../utils/mapChatbot';
import { submitLeadApi } from '../../api/lead.api';

let liveEffectGen = 0;

/** Browser console timing for wake → reply latency debugging. */
function liveDebug(label, detail = '') {
  const t = new Date().toLocaleTimeString('en-GB', { hour12: false });
  const ms = detail !== '' && detail != null ? ` | ${detail}` : '';
  console.log(`[LiveDebug ${t}] ${label}${ms}`);
}

function msSince(startMs) {
  if (!startMs) return 'n/a';
  return `${Date.now() - startMs} ms`;
}

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
  const [autoAdvanceSlides, setAutoAdvanceSlides] = useState(false);
  const [activePdfName, setActivePdfName] = useState('');
  const [leadForm, setLeadForm] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [activationKey, setActivationKey] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadFormEditable, setLeadFormEditable] = useState(false);
  const [canShowEndChat, setCanShowEndChat] = useState(false);

  const stopMicRef = useRef(null);
  const socketRef = useRef(null);
  const startingRef = useRef(false);
  const sessionStartedRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isActivatedRef = useRef(false);
  const isListeningRef = useRef(false);
  const chatbotIdRef = useRef(chatbotId);
  const wantMicRef = useRef(false);
  const cancelPlaybackIdleRef = useRef(null);
  const endChatDelayRef = useRef(null);
  /** Debug timing: when user finished speaking / wake fired */
  const userSpeechEndedAtRef = useRef(0);
  /** After End Chat — ignore wake/mic uplink until this timestamp (ms) */
  const postEndMuteUntilRef = useRef(0);
  /** Debug: first bot audio for this turn already logged */
  const replyAudioLoggedRef = useRef(false);
  const replyTranscriptLoggedRef = useRef(false);

  chatbotIdRef.current = chatbotId;

  const clearPlaybackIdle = useCallback(() => {
    if (cancelPlaybackIdleRef.current) {
      cancelPlaybackIdleRef.current();
      cancelPlaybackIdleRef.current = null;
    }
  }, []);

  const startMic = useCallback(async () => {
    if (!socketRef.current) {
      console.warn('[Live] startMic skipped — no socket');
      return false;
    }

    // Stale flag from Strict Mode without an active stream
    if (isListeningRef.current && !stopMicRef.current) {
      isListeningRef.current = false;
    }
    if (isListeningRef.current) return true;

    try {
      wantMicRef.current = true;
      emitWhenConnected('live:mic_on');

      const stop = await startPcmMicStream(
        (base64) => {
          if (Date.now() < postEndMuteUntilRef.current) return;
          emitWhenConnected('live:audio', {
            data: base64,
            mimeType: 'audio/pcm;rate=16000',
          });
        },
        {
          isBotSpeakingRef: isSpeakingRef,
          isActivatedRef,
          onBargeIn: () => {
            if (Date.now() < postEndMuteUntilRef.current) return;
            clearPlaybackIdle();
            stopLivePlayback();
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            userSpeechEndedAtRef.current = Date.now();
            replyAudioLoggedRef.current = false;
            replyTranscriptLoggedRef.current = false;
            liveDebug('USER barge-in (interrupted bot)');
            emitWhenConnected('live:interrupt');
          },
          onSpeechEnd: () => {
            if (Date.now() < postEndMuteUntilRef.current) {
              liveDebug('Wake ignored — post End Chat cooldown');
              return;
            }
            userSpeechEndedAtRef.current = Date.now();
            replyAudioLoggedRef.current = false;
            replyTranscriptLoggedRef.current = false;

            if (!isActivatedRef.current) {
              liveDebug('USER wake speech ended → sending live:wake (needs keyword in STT)');
              console.log('%c[LIVE] Wake attempt — waiting for activation keyword in transcript', 'color:#a78bfa');
              emitWhenConnected('live:wake');
            } else {
              liveDebug('USER pause detected — waiting for Gemini VAD reply');
            }
          },
        }
      );

      stopMicRef.current = stop;
      isListeningRef.current = true;
      setIsListening(true);
      setError('');
      console.log('[Live] Microphone on — say your activation keyword');
      return true;
    } catch (err) {
      const msg = err.message || 'Microphone permission denied';
      setError(msg);
      wantMicRef.current = true;
      isListeningRef.current = false;
      console.error('[Live] Mic error:', msg);
      return false;
    }
  }, [clearPlaybackIdle]);

  const stopMic = useCallback(() => {
    wantMicRef.current = false;
    if (stopMicRef.current) {
      stopMicRef.current();
      stopMicRef.current = null;
    }
    emitWhenConnected('live:mic_off');
    emitWhenConnected('live:audio_end');
    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  const startLiveSession = useCallback(async () => {
    const id = chatbotIdRef.current;
    if (!id) return false;

    // Another boot already starting (React Strict Mode / socket reconnect) — wait for it
    if (startingRef.current) {
      for (let i = 0; i < 80 && startingRef.current; i += 1) {
        await new Promise((r) => setTimeout(r, 50));
      }
      return sessionStartedRef.current;
    }

    if (sessionStartedRef.current) return true;

    startingRef.current = true;
    setStage('connecting');
    setError('');

    try {
      await waitForSocketConnection();
      const socket = socketRef.current || getVoiceSocket();
      socketRef.current = socket;

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

  useEffect(() => {
    if (!chatbotId) return undefined;

    const myGen = ++liveEffectGen;
    const socket = getVoiceSocket();
    socketRef.current = socket;

    const resetToOnboardingUi = () => {
      clearPlaybackIdle();
      stopLivePlayback();
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      isActivatedRef.current = false;
      setIsActivated(false);
      setCanShowEndChat(false);
      if (endChatDelayRef.current) {
        clearTimeout(endChatDelayRef.current);
        endChatDelayRef.current = null;
      }
      setSlides([]);
      setCurrentSlideIndex(0);
      setAutoAdvanceSlides(false);
      setActivePdfName('');
      setShowLeadForm(false);
      setLeadForm(null);
      setShowCamera(false);
      setLeadFormEditable(false);
    };

    const onLiveEvent = (payload) => {
      if (!payload?.type) return;

      switch (payload.type) {
        case 'ready':
          setIsReady(true);
          setStage('ready');
          if (payload.activationKey) setActivationKey(payload.activationKey);
          break;
        case 'activated':
          isActivatedRef.current = true;
          setIsActivated(true);
          setCanShowEndChat(false);
          if (endChatDelayRef.current) clearTimeout(endChatDelayRef.current);
          endChatDelayRef.current = setTimeout(() => setCanShowEndChat(true), 4000);
          console.log('%c[LIVE] Activated — conversation started', 'color:#f59e0b;font-weight:bold');
          liveDebug(
            'BOT activated',
            `since user speech end: ${msSince(userSpeechEndedAtRef.current)}`
          );
          break;
        case 'images': {
          const list = (payload.images || []).map((img) => ({
            ...img,
            url: resolveAssetUrl(img.url),
          }));
          setSlides(list);
          const startIdx =
            typeof payload.initialSlideIndex === 'number' && payload.initialSlideIndex >= 0
              ? Math.min(payload.initialSlideIndex, Math.max(0, list.length - 1))
              : 0;
          setCurrentSlideIndex(startIdx);
          setCarouselHoldMs(payload.holdCarouselMs ?? 5000);
          setAutoAdvanceSlides(Boolean(payload.autoAdvance ?? (list.length > 1)));
          setActivePdfName(payload.pdfName || '');
          liveDebug(
            `IMAGES loaded: ${list.length} from "${payload.pdfName || payload.pdfKey || '?'}"`,
            `start slide ${startIdx + 1}`
          );
          break;
        }
        case 'show_onboarding':
          // Clear slideshow only — never hide an active lead form
          setSlides([]);
          setCurrentSlideIndex(0);
          setAutoAdvanceSlides(false);
          setActivePdfName('');
          setShowCamera(false);
          break;
        case 'chat_ended':
          resetToOnboardingUi();
          userSpeechEndedAtRef.current = 0;
          replyAudioLoggedRef.current = false;
          replyTranscriptLoggedRef.current = false;
          liveDebug('CHAT ended — waiting for next activation keyword');
          break;
        case 'image_sync': {
          const slideIndex = payload.slideIndex;
          if (typeof slideIndex === 'number' && slideIndex >= 0) {
            setCurrentSlideIndex(slideIndex);
            liveDebug(`IMAGE sync → slide ${slideIndex + 1}`, `imageId=${payload.imageId ?? '?'}`);
          } else if (payload.imageId) {
            setSlides((current) => {
              const idx = current.findIndex((s) => s.id === payload.imageId);
              if (idx >= 0) {
                setCurrentSlideIndex(idx);
                liveDebug(`IMAGE sync → slide ${idx + 1}`, `imageId=${payload.imageId}`);
              }
              return current;
            });
          }
          break;
        }
        case 'show_lead_form':
          setLeadForm(payload.data || null);
          setShowLeadForm(true);
          setLeadFormEditable(Boolean(payload.editable));
          liveDebug(
            'LEAD FORM shown on screen',
            JSON.stringify(payload.data || {})
          );
          break;
        case 'activate_camera':
          setShowCamera(true);
          setShowLeadForm(false);
          break;
        case 'lead_saved':
          setLeadSaved(true);
          resetToOnboardingUi();
          setTimeout(() => setLeadSaved(false), 4000);
          if (!isListeningRef.current && wantMicRef.current) {
            startMic().catch(() => {});
          }
          break;
        case 'audio':
          if (!isActivatedRef.current) break;
          if (!replyAudioLoggedRef.current) {
            replyAudioLoggedRef.current = true;
            liveDebug(
              'BOT first audio chunk (reply started playing)',
              `latency since user speech end: ${msSince(userSpeechEndedAtRef.current)}`
            );
          }
          clearPlaybackIdle();
          isSpeakingRef.current = true;
          setIsSpeaking(true);
          playLiveAudioChunk(payload.data, payload.mimeType);
          break;
        case 'turn_complete':
          liveDebug(
            'BOT turn_complete (model finished generating)',
            `total since user speech end: ${msSince(userSpeechEndedAtRef.current)}`
          );
          clearPlaybackIdle();
          cancelPlaybackIdleRef.current = whenPlaybackIdle(() => {
            cancelPlaybackIdleRef.current = null;
            isSpeakingRef.current = false;
            setIsSpeaking(false);
            liveDebug(
              'BOT playback finished (speakers idle)',
              `total since user speech end: ${msSince(userSpeechEndedAtRef.current)}`
            );
          });
          break;
        case 'transcript':
          if (payload.final) {
            const text = String(payload.text || '').trim();
            if (!text || /^\(?\s*silence\s*\)?$/i.test(text)) break;
            if (payload.role === 'user') {
              console.log(`%c[USER] ${text}`, 'color:#22c55e;font-weight:bold');
              liveDebug(`USER said: "${text}"`);
            } else if (payload.role === 'assistant') {
              console.log(`%c[BOT] ${text}`, 'color:#38bdf8;font-weight:bold');
              if (!replyTranscriptLoggedRef.current) {
                replyTranscriptLoggedRef.current = true;
                liveDebug(
                  `BOT said: "${text}"`,
                  `text latency since user speech end: ${msSince(userSpeechEndedAtRef.current)}`
                );
              } else {
                liveDebug(`BOT said (cont): "${text}"`);
              }
            }
          }
          break;
        case 'error':
          setError(payload.message);
          setStage('error');
          break;
        case 'interrupted':
          clearPlaybackIdle();
          stopLivePlayback();
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          break;
        default:
          break;
      }
    };

    const bootSessionAndMic = async () => {
      if (liveEffectGen !== myGen) return;

      const ok = await startLiveSession();
      // Stale effect after Strict Mode remount — the newer mount owns mic start
      if (!ok || liveEffectGen !== myGen) return;

      wantMicRef.current = true;
      if (isListeningRef.current && !stopMicRef.current) {
        isListeningRef.current = false;
      }
      if (isListeningRef.current) return;

      const micOk = await startMic();
      if (!micOk) {
        console.warn('[Live] Mic did not start — check browser mic permission');
      }
    };

    const onSocketConnect = () => {
      console.log('[Live] Socket connected — restoring session…');
      bootSessionAndMic().catch((err) => {
        console.error('[Live] Boot failed:', err);
      });
    };

    socket.on('live:event', onLiveEvent);
    socket.on('connect', onSocketConnect);

    bootSessionAndMic().catch((err) => {
      console.error('[Live] Boot failed:', err);
    });

    return () => {
      socket.off('live:event', onLiveEvent);
      socket.off('connect', onSocketConnect);
      clearPlaybackIdle();

      // Free listening flag immediately so the remount can start mic
      const stopHandle = stopMicRef.current;
      stopMicRef.current = null;
      isListeningRef.current = false;
      setIsListening(false);

      // Delay teardown so React Strict Mode / fast remount does not kill the session
      setTimeout(() => {
        stopHandle?.();

        if (liveEffectGen !== myGen) return;

        disposeLivePlayback();

        if (sessionStartedRef.current) {
          socket.emit('live:stop');
          sessionStartedRef.current = false;
        }
      }, 350);

      setSessionStarted(false);
      setIsReady(false);
      setIsActivated(false);
      setIsSpeaking(false);
    };
  }, [chatbotId, startLiveSession, startMic, clearPlaybackIdle]);

  const endChat = useCallback(() => {
    if (!socketRef.current || !isActivatedRef.current) return;
    if (!canShowEndChat) {
      console.log('[Live] End Chat ignored — greeting still starting');
      return;
    }

    clearPlaybackIdle();
    stopLivePlayback();
    isSpeakingRef.current = false;
    setIsSpeaking(false);
    isActivatedRef.current = false;
    setIsActivated(false);
    setCanShowEndChat(false);
    setSlides([]);
    setCurrentSlideIndex(0);
    setAutoAdvanceSlides(false);
    setActivePdfName('');
    setShowLeadForm(false);
    setLeadForm(null);
    setShowCamera(false);
    setLeadFormEditable(false);

    emitWhenConnected('live:interrupt');
    emitWhenConnected('live:end_chat');
    // Prevent leftover speaker/mic audio from re-activating immediately
    postEndMuteUntilRef.current = Date.now() + 5000;
    liveDebug('CHAT ended — 5s cooldown, then say salam/keyword clearly');
    console.log('%c[LIVE] Chat ended — waiting for activation keyword', 'color:#f97316;font-weight:bold');
    console.log('[Live] End Chat — onboarding restored, waiting for keyword');
  }, [clearPlaybackIdle, canShowEndChat]);

  const closeCamera = useCallback(() => {
    setShowCamera(false);
  }, []);

  const handleCardScanned = useCallback((leadData, rawResult) => {
    setShowCamera(false);
    setLeadForm(leadData);
    setShowLeadForm(true);
    setLeadFormEditable(true);

    const cardMessage = `[CARD_SCANNED]
Raw Text: ${rawResult?.displayText || rawResult?.rawText || ''}
Extracted Data: ${JSON.stringify(leadData)}`;

    emitWhenConnected('live:text', { text: cardMessage });
    console.log('[Live] Card scanned via Mindee — form shown for confirmation');
  }, []);

  const openCameraForRescan = useCallback(() => {
    setShowLeadForm(false);
    setLeadForm(null);
    setLeadFormEditable(false);
    setShowCamera(true);
  }, []);

  const confirmLeadForm = useCallback(
    async (formData) => {
      if (!chatbotIdRef.current || leadSubmitting) return;

      setLeadSubmitting(true);
      setError('');

      try {
        await submitLeadApi({
          ...formData,
          chatbotId: chatbotIdRef.current,
          sessionId: socketRef.current?.id || '',
        });

        setLeadSaved(true);
        setShowLeadForm(false);
        setLeadForm(null);
        setLeadFormEditable(false);
        setSlides([]);
        setCurrentSlideIndex(0);
        setAutoAdvanceSlides(false);
        setActivePdfName('');
        isActivatedRef.current = false;
        setIsActivated(false);
        setTimeout(() => setLeadSaved(false), 4000);

        emitWhenConnected('live:interrupt');
        emitWhenConnected('live:end_chat');
        postEndMuteUntilRef.current = Date.now() + 5000;

        console.log('[Live] Lead saved — chat ended, onboarding restored');
      } catch (err) {
        setError(err.message || 'Failed to save details');
      } finally {
        setLeadSubmitting(false);
      }
    },
    [leadSubmitting]
  );

  const cancelLeadForm = useCallback(() => {
    setShowLeadForm(false);
    setLeadForm(null);
    setLeadFormEditable(false);
  }, []);

  return {
    sessionStarted,
    isReady,
    isActivated,
    canShowEndChat,
    isListening,
    isSpeaking,
    stage,
    error,
    slides,
    currentSlideIndex,
    carouselHoldMs,
    autoAdvanceSlides,
    activePdfName,
    leadForm,
    showLeadForm,
    showCamera,
    leadSaved,
    leadSubmitting,
    leadFormEditable,
    activationKey,
    endChat,
    closeCamera,
    handleCardScanned,
    openCameraForRescan,
    confirmLeadForm,
    cancelLeadForm,
  };
}
