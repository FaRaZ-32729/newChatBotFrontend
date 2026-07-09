/**
 * Socket.IO client — single shared connection per browser tab.
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
}

/** One socket instance only — never create duplicates on reconnect */
export function getVoiceSocket() {
  if (!socket) {
    socket = io(API_ORIGIN, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      autoConnect: true,
    });
    attachSocketLogs(socket);
  }
  return socket;
}

/** Wait until the shared socket is connected */
export function waitForSocketConnection(timeoutMs = 15000) {
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
      cleanup();
      connectPromise = null;
      reject(new Error(err.message || 'Socket connection failed'));
    };

    const cleanup = () => {
      clearTimeout(timer);
      s.off('connect', onConnect);
      s.off('connect_error', onError);
    };

    s.once('connect', onConnect);
    s.once('connect_error', onError);
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
