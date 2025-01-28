// server/src/wss.ts
import fs from 'fs';
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import { Application } from 'express';
import { WebSocketServer, WebSocket } from 'ws';

interface Notification {
  text: string;
  date: number;
  type: 'notify' | 'broadcast';
}

interface Msg {
  text: string;
  tradeId: string;
  type: 'msg';
  sender: string;
}

interface CustomWebSocketServer extends WebSocketServer {
  sendNotification: (
    notification: string,
    date: number,
    username: string
  ) => Promise<void>;
  broadcast: (notification: string, time?: number) => void;
  sendMsg: (
    msg: string,
    tradeId: string,
    recipient: string,
    sender: string
  ) => void;
}

const notificationsFilePath = path.join(__dirname, 'notifications.json');
const clients = new Map<string, WebSocket>();

// Helper function to read notifications from the file
function readNotifications(): Record<string, Notification[]> {
  if (!fs.existsSync(notificationsFilePath)) {
    return {};
  }
  const data = fs.readFileSync(notificationsFilePath, 'utf-8');
  return JSON.parse(data);
}

// Helper function to write notifications to the file
function writeNotifications(notifications: Record<string, Notification[]>) {
  fs.writeFileSync(
    notificationsFilePath,
    JSON.stringify(notifications, null, 2)
  );
}

const serializeToken = (token: string) => {
  try {
    if (!token) return null;
    const secretKey = process.env.TOKEN_SECRET;
    if (!secretKey) return null;
    const [ivHex, encryptedData] = token.split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      crypto.createHash('sha256').update(secretKey).digest(),
      Buffer.from(ivHex, 'hex')
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const [username, uid, password] = decrypted.split('\n');
    if (!/^[A-Za-z0-9]{3,30}$/.test(username)) return null;
    if (!/^[0-9a-fA-F]{24}$/.test(uid)) return null;
    if (!/^\$argon2(id|i|d)\$.+/.test(password)) return null;
    return username;
  } catch (err) {
    return null;
  }
};

function initializeWebSocket(app: Application) {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server }) as CustomWebSocketServer;

  wss.on('connection', async function (ws, req) {
    try {
      const token = req.url?.replace('/?token=', '');
      if (!token || ['undefined', 'null', ''].includes(token)) {
        ws.close(1008, 'Token required');
        return;
      }

      const username = serializeToken(token);
      if (!username) {
        ws.close(1008, 'Authentication failed');
        return;
      }
      clients.set(username, ws);

      // Read pending notifications for the user
      const notifications = readNotifications();
      const userNotifications = notifications[username] || [];

      // Send pending notifications to the user
      for (const notify of userNotifications) {
        ws.send(JSON.stringify(notify));
      }

      // Clear the user's notifications after sending
      delete notifications[username];
      writeNotifications(notifications);

      ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        if (data.type === 'msg')
          wss.sendMsg(data.text, data.tradeId, data.target, username);
      });

      ws.on('close', () => {
        clients.delete(username);
      });
    } catch (err) {
      console.error('WS connection error:', err);
      ws.close(1008, 'Authentication failed');
    }
  });

  wss.sendNotification = async (
    notification: string,
    date = Date.now(),
    username: string
  ) => {
    try {
      const client = clients.get(username);
      const notify: Notification = { text: notification, date, type: 'notify' };

      if (client?.readyState === WebSocket.OPEN)
        client.send(JSON.stringify(notify));
      else {
        // Store the notification in the file if the user is offline
        const notifications = readNotifications();
        if (!notifications[username]) notifications[username] = [];
        notifications[username].push(notify);
        writeNotifications(notifications);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  wss.broadcast = (notification: string, time = Date.now()) => {
    const message = JSON.stringify({
      text: notification,
      time,
      type: 'broadcast',
    });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    });
  };

  wss.sendMsg = (
    msg: string,
    tradeId: string,
    recipient: string,
    sender: string
  ) => {
    try {
      const client = clients.get(recipient);
      const message: Msg = { text: msg, tradeId, type: 'msg', sender };
      if (client?.readyState === WebSocket.OPEN)
        client.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending msg:', error);
    }
  };

  return { wss, clients, server };
}

export { initializeWebSocket };
