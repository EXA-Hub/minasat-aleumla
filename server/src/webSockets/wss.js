// my-api/src/webSockets/wss.js
import http from 'http';
import { WebSocketServer } from 'ws';
import { decryptToken } from '../../../api/src/utils/token-sys.js';
import User from '../../../api/src/utils/schemas/mongoUserSchema.js';
import { connectToMongoDB } from '../../../api/src/utils/libs/mongoose.js';

const clients = new Map();

function initializeWebSocket(app) {
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', async function (ws, req) {
    try {
      const token = req.url.replace('/?token=', '');
      if (!token || ['undefined', 'null', ''].includes(token)) {
        ws.close(1008, 'Token required');
        return;
      }
      const decryptedData = decryptToken(token);
      const [username, uid, password] = decryptedData.split('\n');
      await connectToMongoDB();
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

  /**
   * Send a notification to the user with the given username.
   * If the user is currently connected via WebSocket, send the notification directly.
   * Otherwise, store the notification in the user's notifications array.
   * @param {string} notification The text of the notification
   * @param {number} [time] The time of the notification (defaults to current time)
   * @param {string} username The username of the user to send the notification to
   */
  wss.sendNotification = async (notification, time = Date.now(), username) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return;
      const client = clients.get(user.username);
      const notify = { text: notification, time: time };
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
