/**
 * useVoiceRecorder — records mic audio into a Blob.
 * Uses refs so tap/stop works even while getUserMedia is still starting.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isStartingRef = useRef(false);
  const stopAfterStartRef = useRef(false);

  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch {
        /* ignore */
      }
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
    };
  }, []);

  const stopRecordingInternal = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;

      if (!recorder || recorder.state === 'inactive') {
        isRecordingRef.current = false;
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mime });
        chunksRef.current = [];

        streamRef.current?.getTracks?.().forEach((t) => t.stop());
        streamRef.current = null;
        mediaRecorderRef.current = null;
        isRecordingRef.current = false;
        setIsRecording(false);

        console.log(`[Voice] Recording stopped — blob size: ${blob.size} bytes`);
        resolve(blob.size > 0 ? blob : null);
      };

      try {
        recorder.requestData?.();
        recorder.stop();
      } catch {
        isRecordingRef.current = false;
        setIsRecording(false);
        resolve(null);
      }
    });
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecordingRef.current || isStartingRef.current) {
      console.log('[Voice] Already recording or starting…');
      return;
    }

    setError('');
    chunksRef.current = [];
    isStartingRef.current = true;
    stopAfterStartRef.current = false;

    try {
      console.log('[Voice] Requesting microphone…');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Collect audio every 250ms so short taps still capture data
      recorder.start(250);
      isRecordingRef.current = true;
      setIsRecording(true);
      console.log('[Voice] Recording started — speak now, tap again to send');

      if (stopAfterStartRef.current) {
        await stopRecordingInternal();
      }
    } catch (err) {
      console.error('[Voice] Microphone error:', err.message);
      setError(err.message || 'Microphone permission denied');
      isRecordingRef.current = false;
      setIsRecording(false);
    } finally {
      isStartingRef.current = false;
    }
  }, [stopRecordingInternal]);

  const stopRecording = useCallback(async () => {
    if (isStartingRef.current) {
      console.log('[Voice] Stop queued — mic still starting…');
      stopAfterStartRef.current = true;
      return null;
    }

    if (!isRecordingRef.current) {
      console.warn('[Voice] Stop ignored — not recording');
      return null;
    }

    return stopRecordingInternal();
  }, [stopRecordingInternal]);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
  };
}
