import crypto from 'crypto';
import { Router } from 'express';
import { authenticator } from 'otplib';
import User from '../../utils/schemas/mongoUserSchema.js';
import config from '../../config.js';

// redis
import getRedisClient from '../../utils/libs/redisClient.js';

const router = Router();
const { apps } = config;

// 🔹 Function to create a Redis key
const generateCacheKey = (appId, query) => {
  return crypto
    .createHash('sha256')
    .update(`tfa_${appId}` + JSON.stringify(query))
    .digest('hex'); // Convert hash to string
};

// =================== 🔵 GET APPS ROUTE ===================
router.get('/apps', (req, res) => {
  res.json(
    apps.map(({ id, name, svg, bgColor, redirectUrl }) => ({
      id,
      name,
      svg,
      bgColor,
      redirectUrl,
    }))
  );
});

// =================== 🔵 LOGIN ROUTE ===================
router.post('/apps/login', async (req, res) => {
  try {
    const redisClient = await getRedisClient();
    const app = config.apps.find(
      (app) => app.id.toLowerCase() === req.body.app.toLowerCase()
    );
    if (!app) return res.status(400).json({ error: 'التطبيق غير موجود' });

    // Generate unique cache key
    const cacheKey = generateCacheKey(req.body.app, req.body.query);

    // 🔹 Retrieve from Redis
    const cacheData = await redisClient.get(cacheKey);
    const cache = cacheData ? JSON.parse(cacheData) : null;

    // 🔹 Use cache if available
    const user = cache
      ? await User.findById(cache.id)
      : await app.login(req.body, User);
    if (!user)
      return res.status(401).json({ error: 'لم يتم ربط حساب المستخدم' });

    if (user.twoFactorEnabled) {
      // 🔹 Store in Redis with expiration
      await redisClient.set(
        cacheKey,
        JSON.stringify({ id: user._id.toString() }),
        'EX',
        60
      );

      if (!req.body.tfaCode) return res.status(202).json({ requiresMFA: true });

      const isValid = authenticator.verify({
        token: req.body.tfaCode,
        secret: user.twoFactorSecret,
      });

      if (!isValid) return res.status(401).json({ error: 'رمز غير صالح' });
    }

    res.status(200).json({ token: user.token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول.' });
  }
});

export default router;
