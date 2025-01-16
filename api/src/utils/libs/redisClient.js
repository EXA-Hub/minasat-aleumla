// api/src/libs/redisClient.js
import { createClient } from 'redis';
import '../env.js';

let redisClient;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL, // Use environment variable for Redis connection
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });

    await redisClient.connect();
  }

  return redisClient;
};

export default getRedisClient;
