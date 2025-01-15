import { error } from 'console';
import { createHash } from 'crypto';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 10 }); // Cache TTL is 600 seconds

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

function cachingMiddleware(req, res, next) {
  try {
    const key = generateCacheKey(req);
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      console.log(
        '\x1b[33m🔄 Using cached response for: \x1b[36m' + key + '\x1b[0m'
      );
      if (!res.headersSent) {
        res.writeHead(cachedResponse.statusCode, {
          ...cachedResponse.headers,
          'Content-Type': 'application/json; charset=utf-8', // Ensure proper JSON and encoding
        });
        res.end(cachedResponse.body);
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

    res.end = function (chunk) {
      if (chunk) {
        cachedData += chunk;
      }

      if (!res.headersSent) {
        originalEnd.call(this, chunk);

        statusCode = res.statusCode;
        if (res.headers) {
          Object.keys(res.headers).forEach((header) => {
            headers[header] = res.headers[header];
          });
        }

        cache.set(key, { statusCode, headers, body: cachedData });
        console.log(
          '\x1b[32m🌟 Caching response for: \x1b[34m' + key + '\x1b[0m'
        );
      }
    };

    next();
  } catch (error) {
    console.error('Error caching response:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default cachingMiddleware;
