import { env } from './utils/env.js';
env();

import cors from 'cors';
import argon2 from 'argon2';
import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express';
import requestIp from 'request-ip';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { join, dirname } from 'path';
import { authenticator } from 'otplib';
import hcaptcha from 'express-hcaptcha';
import { body } from 'express-validator';
import cachingMiddleware from './utils/middleware/cachingMiddleware.js';
import { authenticateToken } from './utils/authenticateToken.js';
import { connectToMongoDB } from './utils/libs/mongoose.js';
import notFoundHandler, { listRoutes } from './404.js';
import User from './utils/schemas/mongoUserSchema.js';
import { limiter } from './utils/libs/redisClient.js';
import blockVpnProxy from './utils/blockVpnProxy.js';
import createUser from './utils/createUser.js';
import config from './config.js';

const CAPTCHA_SECRET_KEY = process.env.CAPTCHA_SECRET_KEY;
const app = express();

app.set('trust proxy', 1);
app.set('x-powered-by', false);
app.disable('x-powered-by');

app.use(morgan('dev'));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'خطآ في الخادم' });
});
app.use(requestIp.mw());
// app.use(blockVpnProxy);
app.use((req, res, next) => {
  if (req.path.includes('bots')) next();
  else limiter(req, res, next);
});
app.use(
  cors({
    origin: [
      'http://192.168.100.45:5173',
      'https://minasat-aleumla.vercel.app',
    ],
  })
);
app.use(helmet());
// Serve static files from the public folder
app.use(
  express.static(
    join(dirname(fileURLToPath(import.meta.url)), '..', 'public'),
    {
      maxAge: '1d',
      immutable: true,
    }
  )
);

app.use((req, res, next) => {
  if (req.path.includes('bots')) next();
  else bodyParser.json()(req, res, next);
});

app.use((req, res, next) => {
  cachingMiddleware(req, res, next, listRoutes(app, true), [
    '/webhooks/bots/discord/routes/interactions',
  ]);
});

// Add before any route handlers:
app.use((req, res, next) => {
  connectToMongoDB()
    .then(() => next())
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'خطآ في الخادم' });
    });
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
  const { username, tier, balance, profile } = req.user;
  res.send({
    username,
    balance,
    fee: subscriptions[tier].features.wallet.fee,
    profile,
    tier,
  });
});

import { loadRoutes } from './routeLoader.js';
await loadRoutes(app, { authenticateToken });

app.all('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'لقد وصلت إلى الخادم, عالم آخر يمكنك تركه وشأنه.' });
});

// Use the 404 handler
app.use(notFoundHandler(app, config.isProduction));

try {
  app.listen(port, host, () => {
    if (!config.isProduction)
      console.log(`App listening at http://${host}:${port}`);
  });
} catch (e) {
  console.error(`Failed to start server at http://${host}:${port}:`, e);
  if (host !== 'localhost') {
    console.log('Retrying with localhost...');
    app.listen(port, () => {
      console.log(`App listening at http://localhost:${port}`);
    });
  }
}

export default app;
