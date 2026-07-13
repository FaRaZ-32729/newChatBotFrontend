/**
 * Detect active speaker face angle via MediaPipe FaceMesh,
 * then POST significant angle changes to backend → MQTT.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { API_ORIGIN } from '../../api/config';

const ANGLE_HYSTERESIS = 8;
const HORIZONTAL_FOV = 70;

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function getMostFrequent(arr) {
  if (!arr.length) return 0;
  const count = {};
  arr.forEach((i) => {
    count[i] = (count[i] || 0) + 1;
  });
  return parseInt(
    Object.keys(count).reduce((a, b) => (count[a] > count[b] ? a : b)),
    10
  );
}

function waitForMediaPipe(timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (window.FaceMesh && window.Camera) {
      resolve();
      return;
    }

    const started = Date.now();
    const timer = setInterval(() => {
      if (window.FaceMesh && window.Camera) {
        clearInterval(timer);
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error('MediaPipe FaceMesh/Camera not loaded'));
      }
    }, 100);
  });
}

export default function SpeakerAngle({ isActive }) {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const streamRef = useRef(null);
  const faceMeshRef = useRef(null);
  const activeSpeakerHistory = useRef([]);
  const previousMouthOpenness = useRef([]);
  const lastReportedAngle = useRef(0);

  const [status, setStatus] = useState('Idle');

  const sendAngleToBackend = useCallback(async (angle) => {
    try {
      console.log(`🔥 Sending Angle to Backend: ${angle}°`);

      const response = await fetch(`${API_ORIGIN}/api/send-angle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ angle: parseFloat(angle.toFixed(1)) }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log('✅ Backend Success:', data);
    } catch (err) {
      console.error('❌ Failed to send angle to backend:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      setStatus('Idle');
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch {
          /* ignore */
        }
        cameraRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (faceMeshRef.current) {
        try {
          faceMeshRef.current.close();
        } catch {
          /* ignore */
        }
        faceMeshRef.current = null;
      }
      return undefined;
    }

    let isMounted = true;
    const video = videoRef.current;
    if (!video) return undefined;

    const onResults = (results) => {
      if (!isMounted) return;

      if (!results.multiFaceLandmarks?.length) {
        setStatus('No face detected');
        return;
      }

      setStatus(`${results.multiFaceLandmarks.length} face(s) detected`);

      let activeSpeaker = null;
      let maxMotion = 0;

      results.multiFaceLandmarks.forEach((landmarks, index) => {
        const upperLip = landmarks[13];
        const lowerLip = landmarks[14];
        const mouthOpen = distance(upperLip, lowerLip);

        if (previousMouthOpenness.current[index] === undefined) {
          previousMouthOpenness.current[index] = mouthOpen;
        }

        const motion = Math.abs(mouthOpen - previousMouthOpenness.current[index]);
        previousMouthOpenness.current[index] = mouthOpen;

        if (motion > maxMotion) {
          maxMotion = motion;
          activeSpeaker = { landmarks, motion, faceIndex: index };
        }
      });

      if (activeSpeaker) {
        activeSpeakerHistory.current.push(activeSpeaker.faceIndex);
        if (activeSpeakerHistory.current.length > 10) {
          activeSpeakerHistory.current.shift();
        }
      }

      const mostCommonFaceIndex = getMostFrequent(activeSpeakerHistory.current);
      const currentActiveLandmarks = results.multiFaceLandmarks[mostCommonFaceIndex];

      if (!currentActiveLandmarks || !video.videoWidth) return;

      const leftMouth = currentActiveLandmarks[61];
      const rightMouth = currentActiveLandmarks[291];
      const px = ((leftMouth.x + rightMouth.x) / 2) * video.videoWidth;
      const dx = px - video.videoWidth / 2;
      const angle = (dx / (video.videoWidth / 2)) * (HORIZONTAL_FOV / 2);
      const clampedAngle = Math.max(-35, Math.min(35, angle));

      if (Math.abs(clampedAngle - lastReportedAngle.current) > ANGLE_HYSTERESIS) {
        lastReportedAngle.current = clampedAngle;
        console.log('🔄 Significant Angle Change:', `${clampedAngle.toFixed(1)}°`);
        sendAngleToBackend(clampedAngle);
      }
    };

    (async () => {
      try {
        setStatus('Loading MediaPipe…');
        await waitForMediaPipe();
        if (!isMounted) return;

        const faceMesh = new window.FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 3,
          refineLandmarks: true,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });
        faceMesh.onResults(onResults);
        faceMeshRef.current = faceMesh;

        setStatus('Starting camera…');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        video.srcObject = stream;

        await video.play().catch(() => {});

        const camera = new window.Camera(video, {
          onFrame: async () => {
            if (isMounted && faceMeshRef.current) {
              await faceMeshRef.current.send({ image: video });
            }
          },
          width: 1280,
          height: 720,
        });

        camera.start();
        cameraRef.current = camera;
        setStatus('Camera & Detection Active');
        console.log('[SpeakerAngle] Camera & Detection Active');
      } catch (err) {
        console.error('[SpeakerAngle]', err);
        setStatus(err.message || 'Camera / FaceMesh failed');
      }
    })();

    return () => {
      isMounted = false;
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch {
          /* ignore */
        }
        cameraRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (faceMeshRef.current) {
        try {
          faceMeshRef.current.close();
        } catch {
          /* ignore */
        }
        faceMeshRef.current = null;
      }
    };
  }, [isActive, sendAngleToBackend]);

  if (!isActive) return null;

  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <div className="absolute bottom-4 left-4 z-40 pointer-events-none text-white/50 text-xs">
        Angle: {status}
      </div>
    </>
  );
}
