/**
 * Socket.IO client — single shared connection, resilient reconnect for live voice.
 */
import { io } from 'socket.io-client';
import { API_ORIGIN } from '../../api/config';

let socket = null;
let connectPromise = null;

function attachSocketLogs(s) {
  if (s.__logsAttached) return;
  s.__logsAttached = true;

  s.on('connect', () => console.log('[Voice] Socket connected:', s.id));
  s.on('disconnect', (reason) => console.warn('[Voice] Socket disconnected:', reason));
  s.on('connect_error', (err) => console.error('[Voice] Socket connect error:', err.message));
  s.on('reconnect', (attempt) => console.log('[Voice] Socket reconnected after', attempt, 'attempt(s)'));
  s.on('reconnect_attempt', (attempt) => console.log('[Voice] Reconnect attempt', attempt));
}

/** One socket instance only — never create duplicates on reconnect */
export function getVoiceSocket() {
  if (!socket) {
    socket = io(API_ORIGIN, {
      withCredentials: true,
      // Prefer websocket; fall back to polling only if upgrade fails
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.3,
      timeout: 20000,
      // Keepalive — match / exceed server so idle voice sessions stay up
      closeOnBeforeunload: false,
    });
    attachSocketLogs(socket);
  }
  return socket;
}

/** Wait until the shared socket is connected */
export function waitForSocketConnection(timeoutMs = 20000) {
  const s = getVoiceSocket();
  if (s.connected) return Promise.resolve(s);

  if (connectPromise) return connectPromise;

  connectPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      connectPromise = null;
      reject(new Error('Socket connection timeout — is backend running on ' + API_ORIGIN + '?'));
    }, timeoutMs);

    const onConnect = () => {
      cleanup();
      connectPromise = null;
      resolve(s);
    };

    const onError = (err) => {
      // Keep waiting for reconnect unless hard timeout fires
      console.warn('[Voice] connect_error (will retry):', err.message);
    };

    const cleanup = () => {
      clearTimeout(timer);
      s.off('connect', onConnect);
      s.off('connect_error', onError);
    };

    s.once('connect', onConnect);
    s.on('connect_error', onError);

    if (!s.active) s.connect();
  });

  return connectPromise;
}

export function socketEmitAck(event, payload, timeoutMs = 120000) {
  return waitForSocketConnection().then(
    (s) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Socket timeout waiting for "${event}"`));
        }, timeoutMs);

        s.emit(event, payload, (response) => {
          clearTimeout(timer);
          if (!response) {
            reject(new Error(`No response from server for "${event}"`));
            return;
          }
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message || 'Socket request failed'));
          }
        });
      })
  );
}

/** Safe emit — drops only if socket is fully down (avoids silent queue loss). */
export function emitWhenConnected(event, payload) {
  const s = getVoiceSocket();
  if (!s.connected) {
    console.warn(`[Voice] Dropped "${event}" — socket not connected`);
    return false;
  }
  s.emit(event, payload);
  return true;
}
