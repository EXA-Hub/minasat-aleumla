import express from 'express';
const app = express();
import { initializeWebSocket } from './webSockets/wss.js';
export const ws = initializeWebSocket(app);
ws.server.listen(6996, () => {
  console.log('ws://localhost:6996');
});
