import { useCallback, useEffect, useRef, useState } from 'react';
import { socketEmitAck } from '../socket/voiceSocket';

/**
 * Camera overlay for visiting card scan — triggered by [ACTIVATE_CAMERA].
 */
export default function CardScanner({ active, onClose, onCaptured }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError(err.message || 'Camera permission denied');
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [active]);

  const captureAndScan = useCallback(async () => {
    const video = videoRef.current;
    if (!video || scanning) return;

    setScanning(true);
    setError('');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
      const response = await socketEmitAck('live:card_scan', {
        imageBase64,
        mimeType: 'image/jpeg',
      });

      onCaptured?.(response.data);
      onClose?.();
    } catch (err) {
      setError(err.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  }, [onCaptured, onClose, scanning]);

  if (!active) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <p className="text-white text-center mb-4">Hold your visiting card up to the camera</p>

      <div className="relative w-full max-w-lg aspect-[4/3] rounded-xl overflow-hidden bg-black ring-2 ring-white/30">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {error && <p className="text-rose-400 text-sm mt-3">{error}</p>}

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={captureAndScan}
          disabled={scanning}
          className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium disabled:opacity-50"
        >
          {scanning ? 'Scanning…' : 'Capture card'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 rounded-lg bg-white/10 text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
