import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { initializeSocket } from './socket/socket.js';

await connectDatabase();

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientOrigin,
    methods: ['GET', 'POST']
  }
});

initializeSocket(io);

server.listen(env.port, () => {
  console.log(`Queue Cure API running on port ${env.port}`);
});
