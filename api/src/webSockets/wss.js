// my-api/src/webSockets/wss.js
import http from 'http';
import { WebSocketServer } from 'ws';
import { decryptToken } from '../utils/token-sys.js';
import User from '../utils/schemas/mongoUserSchema.js';

const clients = new Map();

function initializeWebSocket(app) {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', async function (ws, req) {
    try {
      const url = new URL(req.url, 'ws://' + req.headers.host);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Token required');
        return;
      }

      const decryptedData = decryptToken(token);
      const [username, uid, password] = decryptedData.split('\n');
      const user = await User.findOne({ username, _id: uid });
      if (!user) return ws.close(1008, 'User not found');
      if (password !== user.password) return ws.close(1008, 'Invalid token');
      clients.set(username, ws);

      ws.on('close', () => {
        clients.delete(username);
      });

      try {
        const notifications = [...user.notifications];
        user.notifications = [];
        await user.save();

        for (const notify of notifications) {
          try {
            ws.send(JSON.stringify(notify));
          } catch (sendError) {
            user.notifications.push(notify);
            console.error('Error sending notification:', sendError);
          }
        }

        if (user.notifications.length > 0) {
          await user.save();
        }
      } catch (error) {
        console.error('Error saving user:', error);
      }
    } catch (err) {
      console.error('WS connection error:', err);
      ws.close(1008, 'Authentication failed');
    }
  });

  wss.sendNotification = async (notification, time, username) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return;
      const client = clients.get(user.username);
      const notify = { text: notification, time: time || Date.now() };
      if (client && client.readyState === 1) {
        client.send(JSON.stringify(notify));
      } else {
        user.notifications.unshift(notify);
        await user.save();
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  wss.broadcast = (notification, time) => {
    const message = JSON.stringify({
      text: notification,
      time: time || Date.now(),
    });

    clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  };

  return { wss, clients, server };
}

export { initializeWebSocket };
