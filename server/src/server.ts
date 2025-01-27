import dotenv from 'dotenv';
dotenv.config();

import crypto from 'crypto';

function verifyPassword(
  password: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  hash: string
) {
  const candidateHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return candidateHash === hash;
}

const PNHO = {
  salt: '5d81eba419fc97117eeb1ff59e3c42a4',
  hash: '81b92dc62afbd3cb2ca049729dea7adbdd56b6dcf7408caad070fe2e60d0f9972c8d31497ed47179b7309cc240539ba0f04eed7348a71e7720b175e7e1a3e939',
};

const PDHO = {
  salt: '907302e19cdecc75a5743add40d244eb',
  hash: '3312c154f7b470d0716b577ad1fe05559d48f8d27284d0f19cd28ed234088c589f6bbf2006ef6c0da5325bfcc6b21607827b21e3ce1059cf253b84c98b5efa50',
};

const PPPP = {
  salt: '86adca448eb3f3f9294518802940a520',
  hash: '2ea1d887ade2f0fcbe3a83a86bd41e4cfda02d648fcdaf43327c99a21ee10d06ed6bdba5464e9c4006e7246e464d0c957055ed205af3a2a8020747bf80794566',
};

if (
  !process.env.WEBHOOK_TOKEN ||
  !process.env.TOKEN_SECRET ||
  !process.env.PORT ||
  !process.env.PROJECT_DOMAIN ||
  !verifyPassword(process.env.PROJECT_DOMAIN, PDHO.salt, PDHO.hash) ||
  !process.env.PROJECT_NAME ||
  !verifyPassword(process.env.PROJECT_NAME, PNHO.salt, PNHO.hash) ||
  !process.env.ENVIRONMENT ||
  !verifyPassword(process.env.ENVIRONMENT, PPPP.salt, PPPP.hash)
)
  process.exit(1);

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
