// api/src/utils/middleware/cachingMiddleware.js
import { createHash } from 'crypto';
import getRedisClient from '../libs/redisClient.js';
import config from '../../config.js';

function generateCacheKey(req) {
  const keyData = {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    params: req.params,
    ...(req.path.includes('/public/')
      ? {}
      : { token: req.headers['authorization'] }),
  };
  return createHash('sha256').update(JSON.stringify(keyData)).digest('hex');
}

function matchRoute(path, pattern) {
  // Remove trailing slashes from both path and pattern
  path = path.replace(/\/+$/, '');
  pattern = pattern.replace(/\/+$/, '');
  // Convert pattern to regex, replacing :param with regex group
  return new RegExp(
    `^${pattern
      .replace(/:[a-zA-Z]+/g, '([^/]+)')
      .replace(/\//g, '\\/')
      .replace(/\*/g, '.*')}$`
  ).test(path);
}

function shouldCacheRoute(path, includedRoutes, excludedRoutes = []) {
  // First check excluded routes
  if (excludedRoutes.some((route) => matchRoute(path, route))) return false;
  // Then check included routes
  return includedRoutes.some((route) => matchRoute(path, route));
}

// Usage example:
/*
const path = '/api/public/@zampx/profile';
const includedRoutes = ['/api/public/@:user/profile'];
const excludedRoutes = ['/webhooks/bots/discord/interactions'];

const shouldCache = shouldCacheRoute(path, includedRoutes, excludedRoutes);
console.log(shouldCache); // true
*/

/**
 * Caching middleware to store responses in Redis.
 * Handles caching for GET requests only.
 * The cache key is generated using the request method, path, query, body, params, and token.
 * The cached response is stored in Redis as a JSON string containing the status code, headers, and body.
 * The cached response is used if the key is found in Redis.
 * If the cached response is a 302 redirect, the redirect is followed.
 * If not, the cached response is sent with the proper headers and content type.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function cachingMiddleware(
  req,
  res,
  next,
  includedRoutes = [],
  excludedRoutes = []
) {
  try {
    if (!shouldCacheRoute(req.path, includedRoutes, excludedRoutes))
      return next();

    const redisClient = await getRedisClient();
    const key = generateCacheKey(req);
    const cachedResponse = await redisClient.get(key);

    if (cachedResponse) {
      if (!config.isProduction)
        console.log(
          '\x1b[33m🔄 Using cached response for: \x1b[36m' + key + '\x1b[0m'
        );
      if (!res.headersSent) {
        const data = JSON.parse(cachedResponse);
        res.writeHead(data.statusCode, data.headers);
        res.end(data.body);
      }
      return;
    }

    let cachedData = '';

    const originalWrite = res.write;
    const originalEnd = res.end;

    res.write = function (chunk) {
      cachedData += chunk;
      originalWrite.call(this, chunk);
    };

    res.end = async function (chunk) {
      if (chunk) cachedData += chunk;
      if (!res.headersSent) {
        const statusCode = res.statusCode;
        originalEnd.call(this, chunk);
        if (!config.isProduction)
          console.log(
            '\x1b[32m🌟 Caching response for: \x1b[34m' + key + '\x1b[0m'
          );
        await redisClient.set(
          key,
          JSON.stringify({
            statusCode,
            headers: res.getHeaders(),
            body: cachedData,
          }),
          { EX: 60 * 10 }
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
