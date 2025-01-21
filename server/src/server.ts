import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import { initializeWebSocket } from './wss';

const app = express();
app.use(express.json());

const ws = initializeWebSocket(app);

interface AuthRequest extends Request {
  user?: string;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.WEBHOOK_TOKEN) {
    res.status(401).send('Unauthorized');
    return;
  }
  next();
};

app.options('/isOnline/:username', (req: AuthRequest, res: Response) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.sendStatus(200);
});

app.get('/isOnline/:username', (req: AuthRequest, res: Response) => {
  res.header('Access-Control-Allow-Origin', '*');
  if (ws.clients.has(req.params.username)) res.sendStatus(200);
  else res.sendStatus(404);
});

app.post('/broadcast', auth, (req: AuthRequest, res: Response) => {
  const { msg, date } = req.body;
  if (!msg || !date) return;
  res.sendStatus(200);
  ws.wss.broadcast(msg, date);
});

app.post('/notification', auth, async (req: AuthRequest, res: Response) => {
  const { msg, date, username } = req.body;
  if (!msg || !date || !username) return;
  try {
    await ws.wss.sendNotification(msg, date, username);
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

ws.server.listen(process.env.PORT || 3000, 0, () => {
  console.log('ws://0.0.0.0:' + (process.env.PORT || 3000));
});
