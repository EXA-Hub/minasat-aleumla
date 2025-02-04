// api/src/utils/middleware/security.js
import xss from 'xss';
import cors from 'cors';
import helmet from 'helmet';
import requestIp from 'request-ip';
import mongoSanitize from 'express-mongo-sanitize';
// import blockVpnProxy from '../blockVpnProxy.js';
import { limiter } from '../libs/redisClient.js';

const sanitizeData = (data) => {
  if (typeof data === 'string') return xss(data);
  if (Array.isArray(data)) return data.map((item) => sanitizeData(item));
  if (typeof data === 'object' && data !== null) {
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = sanitizeData(data[key]);
      return acc;
    }, {});
  }
  return data;
};

export const configureSecurityMiddleware = (app) => {
  // Trust proxy for correct IP handling
  app.set('trust proxy', 1);

  // Disable unnecessary headers
  app.set('x-powered-by', false);
  app.disable('x-powered-by');

  // Handle preflight requests first
  app.options('*', cors());

  // Security middleware
  app.use(requestIp.mw()); // Get client IP
  app.use(mongoSanitize()); // Sanitize MongoDB queries

  // Helmet for HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: false, // Disable for CORS compatibility
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      dnsPrefetchControl: true,
      frameguard: true,
      hidePoweredBy: true,
      hsts: true,
      ieNoOpen: true,
      noSniff: true,
      permittedCrossDomainPolicies: true,
      referrerPolicy: true,
      xssFilter: true,
    })
  );

  // Rate limiting
  app.use(limiter);

  // CORS configuration
  app.use(
    cors({
      origin: [
        'http://localhost:5173',
        'http://192.168.100.45:5173',
        'https://minasat-aleumla.vercel.app',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true, // Allow cookies/auth headers
      optionsSuccessStatus: 200, // Legacy browser support
    })
  );

  // Data sanitization
  app.use((req, res, next) => {
    req.body = sanitizeData(req.body);
    req.query = sanitizeData(req.query);
    req.params = sanitizeData(req.params);
    next();
  });
};
