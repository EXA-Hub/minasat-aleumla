import dotenv from 'dotenv-safe';
dotenv.config({
  allowEmptyValues: true,
});

import cors from 'cors';
import argon2 from 'argon2';
import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express';
import mongoose from 'mongoose';
import requestIp from 'request-ip';
import bodyParser from 'body-parser';
import { authenticator } from 'otplib';
import hcaptcha from 'express-hcaptcha';
import { body } from 'express-validator';
import { rateLimit } from 'express-rate-limit';
import cachingMiddleware from './utils/middleware/cachingMiddleware.js';
import { authenticateToken } from './utils/authenticateToken.js';
import User from './utils/schemas/mongoUserSchema.js';
import blockVpnProxy from './utils/blockVpnProxy.js';
import createUser from './utils/createUser.js';
import config from './config.js';

const CAPTCHA_SECRET_KEY = process.env.CAPTCHA_SECRET_KEY;
const app = express();

app.set('trust proxy', false);
app.disable('x-powered-by');

app.use(morgan('dev'));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'خطآ في الخادم' });
});
app.use(requestIp.mw());
app.use(blockVpnProxy);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: false, // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
  })
);
app.use(
  cors({
    origin: ['http://192.168.100.45:5173'],
  })
);
app.use(helmet());
/**
 * 
 * underTest
 * 
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"], // Restrict sources for scripts, styles, etc.
        scriptSrc: ["'self'", 'trusted-cdn.com'],
        styleSrc: ["'self'", 'trusted-cdn.com'],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable this header
    hsts: {
      maxAge: 31536000, // Enforce HTTPS for 1 year
      includeSubDomains: true,
    },
    referrerPolicy: { policy: 'no-referrer' }, // Prevent referrer leakage
  })
);
app.use((req, res, next) => {
  res.setHeader('X-Directory-Listing', 'disabled');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));

 */
app.use(bodyParser.json());
app.use(cachingMiddleware);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

import { validateRequest } from './utils/middleware/validateRequest.js';

// Signup Route
app.post(
  '/signup',
  [
    body('username')
      .isString()
      .isLength({ min: 3 })
      .withMessage('إسم المستخدم يجب ألا يقل عن 3 أحرف.')
      .trim(),
    body('password')
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage('جرب كلمة سر أقوى.'),
    body('token').notEmpty().withMessage('أثبت أنك لست روبوت.'),
    body('referralId').optional(),
    validateRequest,
  ],
  hcaptcha.middleware.validate(CAPTCHA_SECRET_KEY),
  async (req, res) => {
    try {
      const { username, password, referralId } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'اسم المستخدم مستخدم بالفعل' });
      }

      const hashedPassword = await argon2.hash(password); // Hash password
      const user = await createUser(username, hashedPassword, referralId);

      res.status(201).json({ token: user.token });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'An error occurred during signup.' });
    }
  }
);

// login route in index.js
app.post(
  '/login',
  [
    body('username').isString().isLength({ min: 3 }).trim(),
    body('password').isStrongPassword(),
    body('token').notEmpty().withMessage('أثبت أنك لست روبوت.'),
    body('tfaCode').optional(),
    validateRequest,
  ],
  hcaptcha.middleware.validate(CAPTCHA_SECRET_KEY),
  async (req, res) => {
    try {
      const { username, password, tfaCode } = req.body;
      const user = await User.findOne({ username });

      if (!user || !(await argon2.verify(user.password, password))) {
        return res
          .status(401)
          .json({ error: 'خطأ في إسم المستخدم أو كلمة المرور' });
      }

      if (user.twoFactorEnabled) {
        if (!tfaCode) {
          return res.status(202).json({ requiresMFA: true });
        }

        const isValid = authenticator.verify({
          token: tfaCode,
          secret: user.twoFactorSecret,
        });

        if (!isValid) {
          return res.status(401).json({ error: 'رمز غير صالح' });
        }
      }

      res.status(200).json({ token: user.token });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'An error occurred during login.' });
    }
  }
);

const { port, host, subscriptions } = config;

app.get('/@me', authenticateToken, (req, res) => {
  const { username, tier, balance, profile } = req.user; // Destructure the specific fields you want
  res.send({
    username,
    balance,
    fee: subscriptions[tier].features.wallet.fee,
    profile,
    tier,
  }); // Send only those fields in the response
});

import { initializeWebSocket } from './webSockets/wss.js';
export const ws = initializeWebSocket(app);

import { loadRoutes } from './routeLoader.js';
await loadRoutes(app, { authenticateToken }, ws);

// Use the 404 handler
import notFoundHandler from './404.js';
app.use(notFoundHandler(app));

try {
  ws.server.listen(port, host, () => {
    console.log(`App listening at http://${host}:${port}`);
  });
} catch (e) {
  console.error(`Failed to start server at http://${host}:${port}:`, e);
  if (host !== 'localhost') {
    console.log('Retrying with localhost...');
    ws.server.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  }
}

import startTask from './functions/jobs/ExpiredSubscriptions.js';
startTask(ws.wss.sendNotification);
