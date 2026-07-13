import { useCallback, useEffect, useRef, useState } from 'react';
import { scanVisitingCardApi } from '../../api/cardScan.api';

const AUTO_CAPTURE_DELAY = 5000;

function normalizeToArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return [...new Set(value.map((v) => String(v).trim()).filter(Boolean))];
  }
  return [
    ...new Set(
      String(value)
        .split(/[,;]|(?:\s+and\s+)/i)
        .map((v) => v.trim())
        .filter(Boolean)
    ),
  ];
}

function toLeadFormData(result) {
  const fullName =
    result.fullName
    || result.name
    || [result.firstName, result.lastName].filter(Boolean).join(' ').trim();

  return {
    name: fullName || '',
    company: result.company || '',
    designation: result.designation || result.jobTitle || '',
    phone: normalizeToArray(result.phone).join(', ') || result.phone || '',
    email: normalizeToArray(result.email).join(', ') || result.email || '',
  };
}

/**
 * Camera overlay for visiting card — Mindee OCR via /api/card-scan.
 */
export default function CardScanner({ active, onClose, onScanned }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const autoTimerRef = useRef(null);

  const [status, setStatus] = useState('Initializing camera…');
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [mirrorCamera, setMirrorCamera] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState('');

  const startCameraRef = useRef(null);

  const stopStream = useCallback(() => {
    clearInterval(autoTimerRef.current);
    setCountdown(null);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreamActive(false);
  }, []);

  const captureAndProcess = useCallback(async () => {
    clearInterval(autoTimerRef.current);
    setCountdown(null);

    const video = videoRef.current;
    if (!video || isProcessing) return;

    setIsProcessing(true);
    setError('');
    setStatus('Capturing image…');

    if (!(video.videoWidth > 50 && video.videoHeight > 30)) {
      await new Promise((r) => setTimeout(r, 400));
    }

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    if (mirrorCamera) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPreview(imageDataUrl);
    stopStream();
    setStatus('Reading card with Mindee…');

    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const result = await scanVisitingCardApi(blob);

      const hasMeaningfulData =
        result?.noData !== true
        && Boolean(
          result?.fullName
          || result?.name
          || result?.firstName
          || result?.lastName
          || result?.phone
          || result?.email
        );

      if (!hasMeaningfulData) {
        setStatus('Card not detected clearly. Reopening camera…');
        setCapturedPreview(null);
        setIsProcessing(false);
        setTimeout(() => {
          startCameraRef.current?.();
        }, 1800);
        return;
      }

      setStatus('Card scanned — confirm your details');
      setIsProcessing(false);
      onScanned?.(toLeadFormData(result), result);
      onClose?.();
    } catch (err) {
      console.error('[CardScanner]', err);
      setError(err.message || 'Scan failed');
      setStatus('Scan failed. Reopening camera…');
      setIsProcessing(false);
      setCapturedPreview(null);
      setTimeout(() => {
        startCameraRef.current?.();
      }, 2000);
    }
  }, [isProcessing, mirrorCamera, onClose, onScanned, stopStream]);

  const scheduleAutoCapture = useCallback(() => {
    clearInterval(autoTimerRef.current);
    let remaining = Math.ceil(AUTO_CAPTURE_DELAY / 1000);
    setCountdown(remaining);

    autoTimerRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(autoTimerRef.current);
        setCountdown(null);
        captureAndProcess();
      }
    }, 1000);
  }, [captureAndProcess]);

  const startCamera = useCallback(async () => {
    stopStream();
    setCapturedPreview(null);
    setIsProcessing(false);
    setError('');
    setStatus('Requesting camera access…');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(() => {});
          setStreamActive(true);
          setStatus('Align the card — auto-capture soon, or tap Capture Now');
          scheduleAutoCapture();
        };
      }
    } catch (err) {
      setError(err?.message || 'Camera access denied');
      setStatus('Camera error — please allow camera access');
    }
  }, [scheduleAutoCapture, stopStream]);

  useEffect(() => {
    startCameraRef.current = startCamera;
  }, [startCamera]);

  useEffect(() => {
    if (!active) {
      stopStream();
      return undefined;
    }

    startCamera();
    return () => {
      stopStream();
    };
  }, [active, startCamera, stopStream]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[55] bg-black/95 flex flex-col items-center justify-center p-4 sm:p-6">
      <p className="text-white text-lg sm:text-xl font-semibold mb-3 text-center">
        Scan Your Visiting Card
      </p>

      <div className="relative w-full max-w-lg aspect-[4/3] rounded-xl overflow-hidden bg-black ring-2 ring-white/25">
        {!capturedPreview && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            autoPlay
            muted
            style={{ transform: mirrorCamera ? 'scaleX(-1)' : 'scaleX(1)' }}
          />
        )}

        {capturedPreview && (
          <img
            src={capturedPreview}
            alt="Captured card"
            className="w-full h-full object-cover"
          />
        )}

        {!capturedPreview && streamActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[78%] h-[52%] rounded-lg border-2 border-dashed border-white/50" />
            {countdown !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 text-white text-sm">
                Auto-capture in {countdown}s
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span className="text-white text-sm">Processing…</span>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <p className="text-white/70 text-sm mt-3 text-center max-w-md">{status}</p>
      {error && <p className="text-rose-400 text-sm mt-1 text-center">{error}</p>}

      <div className="flex flex-wrap gap-3 mt-5 justify-center">
        {streamActive && !isProcessing && (
          <>
            <button
              type="button"
              onClick={captureAndProcess}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500"
            >
              Capture Now
            </button>
            <button
              type="button"
              onClick={() => setMirrorCamera((m) => !m)}
              className="px-5 py-2.5 rounded-lg bg-white/10 text-white"
            >
              Mirror: {mirrorCamera ? 'ON' : 'OFF'}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => {
            stopStream();
            onClose?.();
          }}
          className="px-5 py-2.5 rounded-lg bg-white/10 text-white"
          disabled={isProcessing}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
