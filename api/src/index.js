import dotenv from 'dotenv-safe';
dotenv.config({
  allowEmptyValues: true,
});

import express from 'express';
import mongoose from 'mongoose';
import config from './config.js';
import argon2 from 'argon2';
import { body, validationResult } from 'express-validator';
import bodyParser from 'body-parser';
import createUser from './utils/createUser.js';
import User from './utils/schemas/mongoUserSchema.js';
import { rateLimit } from 'express-rate-limit';
import { authenticateToken } from './utils/authenticateToken.js';
import cors from 'cors';
import hcaptcha from 'express-hcaptcha';
import { authenticator } from 'otplib';
import helmet from 'helmet';
import blockVpnProxy from './utils/blockVpnProxy.js';
import requestIp from 'request-ip';

const CAPTCHA_SECRET_KEY = process.env.CAPTCHA_SECRET_KEY;
const app = express();

app.set('trust proxy', false);
app.use(requestIp.mw());
app.use(blockVpnProxy);
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
  })
);
app.use(
  helmet({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
  })
);
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

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
  ],
  hcaptcha.middleware.validate(CAPTCHA_SECRET_KEY),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
  ],
  hcaptcha.middleware.validate(CAPTCHA_SECRET_KEY),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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

app.get('/@me', authenticateToken, (req, res) => {
  res.send(req.user);
});

import { initializeWebSocket } from './webSockets/wss.js';
export const ws = initializeWebSocket(app);

import { loadRoutes } from './routeLoader.js';
await loadRoutes(app, { authenticateToken }, ws);

// Use the 404 handler
import notFoundHandler from './404.js';
app.use(notFoundHandler(app));

const { port, host } = config;

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

import startTask from './functions/cornJobs/ExpiredSubscriptions.js';
startTask(ws.wss.sendNotification);
