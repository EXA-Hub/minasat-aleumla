// api/src/utils/middleware/cachingMiddleware.js
import { createHash } from 'crypto';
import getRedisClient from '../libs/redisClient.js';

function generateCacheKey(req) {
  const keyData = {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    params: req.params,
    token: req.headers['authorization'],
  };
  return createHash('sha256').update(JSON.stringify(keyData)).digest('hex');
}

async function cachingMiddleware(req, res, next) {
  try {
    const redisClient = await getRedisClient();

    const key = generateCacheKey(req);
    const cachedResponse = await redisClient.get(key);

    if (cachedResponse) {
      console.log(
        '\x1b[33m🔄 Using cached response for: \x1b[36m' + key + '\x1b[0m'
      );
      if (!res.headersSent) {
        const data = JSON.parse(cachedResponse);
        res.writeHead(data.statusCode, {
          ...data.headers,
          'Content-Type': 'application/json; charset=utf-8', // Ensure proper JSON and encoding
        });
        res.end(data.body);
      }
      return;
    }

    let cachedData = '';
    const headers = {};
    let statusCode;

    const originalWrite = res.write;
    const originalEnd = res.end;

    res.write = function (chunk) {
      cachedData += chunk;
      originalWrite.call(this, chunk);
    };

    res.end = async function (chunk) {
      if (chunk) cachedData += chunk;
      if (!res.headersSent) {
        originalEnd.call(this, chunk);
        statusCode = res.statusCode;
        if (res.headers)
          Object.keys(res.headers).forEach((header) => {
            headers[header] = res.headers[header];
          });
        console.log(
          '\x1b[32m🌟 Caching response for: \x1b[34m' + key + '\x1b[0m'
        );
        await redisClient.set(
          key,
          JSON.stringify({ statusCode, headers, body: cachedData }),
          { EX: 10 } // Cache for 10 seconds
        );
      }
    };

    next();
  } catch (error) {
    console.error('Error caching response:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'حدث خطأ أثناء إيجاد البيانات' });
    }
  }
}

export default cachingMiddleware;
