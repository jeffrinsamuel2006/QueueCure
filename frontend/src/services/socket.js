import { io } from 'socket.io-client';
import { API_URL } from './api';

export const socket = io(API_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 800
});
