// api/src/utils/webhook.js
import { env } from '../utils/env.js';
env();
export const ws = {
  wss: {
    sendNotification: async (msg, date, username) => {
      try {
        await fetch(process.env.WEBHOOK_URL + '/notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer ' + process.env.WEBHOOK_TOKEN,
          },
          body: JSON.stringify({ msg, date, username }),
        });
      } catch (error) {
        console.log(error);
      }
    },
    brodcast: async (msg, date) => {
      try {
        fetch(process.env.WEBHOOK_URL + '/broadcast', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: 'Bearer ' + process.env.WEBHOOK_TOKEN,
          },
          body: JSON.stringify({ msg, date }),
        });
      } catch (error) {
        console.log(error);
      }
    },
  },
  clients: {
    has: (username) => {
      return process.env.WEBHOOK_URL + '/isOnline/' + username;
    },
  },
};
