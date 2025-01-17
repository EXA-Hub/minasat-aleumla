// api/src/libs/redisClient.js
import { createClient } from 'redis';
import { rateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import '../env.js';

let redisClient;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await redisClient.connect();
  }

  return redisClient;
};

export const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: async (...args) => {
      const client = await getRedisClient();
      return client.sendCommand(args);
    },
  }),
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: false,
  legacyHeaders: false,
});

export default getRedisClient;
