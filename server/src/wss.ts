// server/src/wss.ts
import http from 'http';
import { QuickDB } from 'quick.db';
import { Application } from 'express';
import { WebSocketServer, WebSocket } from 'ws';

interface Notification {
  text: string;
  date: number;
}

interface CustomWebSocketServer extends WebSocketServer {
  sendNotification: (
    notification: string,
    date: number,
    username: string
  ) => Promise<void>;
  broadcast: (notification: string, time?: number) => void;
}

const db = new QuickDB();
const clients = new Map<string, WebSocket>();

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

      const response = await fetch(
        process.env.WEBHOOK_URL + '/webhooks/getMe',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        ws.close(1008, 'Authentication failed');
        return;
      }

      const username = await response.text();
      clients.set(username, ws);

      const waitedNotifications =
        (await db.get(`notifications.${username}`)) || [];
      for (const notify of waitedNotifications) {
        ws.send(JSON.stringify(notify));
      }
      await db.delete(`notifications.${username}`);

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
      const notify: Notification = { text: notification, date };

      if (client?.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notify));
      } else {
        const waitedNotifications =
          (await db.get(`notifications.${username}`)) || [];
        waitedNotifications.push(notify);
        await db.set(`notifications.${username}`, waitedNotifications);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  wss.broadcast = (notification: string, time = Date.now()) => {
    const message = JSON.stringify({ text: notification, time });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    });
  };

  return { wss, clients, server };
}

export { initializeWebSocket };
