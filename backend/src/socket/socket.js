import { SOCKET_EVENTS } from './events.js';
import { getQueueStatus } from '../services/queueService.js';

let ioInstance;

export function initializeSocket(io) {
  ioInstance = io;

  io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
    socket.emit(SOCKET_EVENTS.QUEUE_UPDATED, await getQueueStatus());
  });
}

export function emitQueueEvent(eventName, payload) {
  if (!ioInstance) return;
  ioInstance.emit(eventName, payload);
  if (payload?.activity) {
    ioInstance.emit(SOCKET_EVENTS.ACTIVITY_CREATED, payload.activity);
  }
  if (eventName !== SOCKET_EVENTS.QUEUE_UPDATED) {
    ioInstance.emit(SOCKET_EVENTS.QUEUE_UPDATED, payload.queue || payload);
  }
}
