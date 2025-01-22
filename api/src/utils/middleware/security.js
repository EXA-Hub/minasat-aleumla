// api/src/utils/middleware/security.js
import xss from 'xss';
import helmet from 'helmet';
import requestIp from 'request-ip';
import mongoSanitize from 'express-mongo-sanitize';

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
  app.set('trust proxy', 1);
  app.set('x-powered-by', false);
  app.disable('x-powered-by');

  app.use(requestIp.mw());
  app.use(mongoSanitize());
  app.use(
    helmet({
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: true,
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

  app.use((req, res, next) => {
    req.body = sanitizeData(req.body);
    req.query = sanitizeData(req.query);
    req.params = sanitizeData(req.params);
    next();
  });
};
