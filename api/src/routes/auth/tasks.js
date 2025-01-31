// my-api/src/routes/auth/tasks.js
import mongoose from 'mongoose';
import { Router } from 'express';
import { query } from 'express-validator';
import { validateRequest } from '../../utils/middleware/validateRequest.js';
import getRedisClient from '../../utils/libs/redisClient.js';
import blockVpnProxy from '../../utils/blockVpnProxy.js';
import config from '../../config.js';

const dailyIpSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false, // Disable the __v field
    // _id: false, // Disable the _id field
    timestamps: true,
  }
);

const DailyIp = mongoose.model('DailyIp', dailyIpSchema);

const generateShortURL = async (url, expirationMinutes = 15) => {
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() + expirationMinutes); // Add expiration time

  const expiration = {
    year: currentTime.getUTCFullYear(),
    month: currentTime.getUTCMonth() + 1, // Months are 0-indexed
    day: currentTime.getUTCDate(),
    hour: currentTime.getUTCHours(),
    minute: currentTime.getUTCMinutes(),
  };

  const apiUrl = `https://linkjust.com/api?api=${
    process.env.LINKJUST_API_KEY
  }&url=${encodeURIComponent(url)}&format=json&expiration[year]=${
    expiration.year
  }&expiration[month]=${expiration.month}&expiration[day]=${
    expiration.day
  }&expiration[hour]=${expiration.hour}&expiration[minute]=${
    expiration.minute
  }`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to generate short URL: ${response.message}\n${response.status}`
    );
  }

  const data = await response.json();
  return data.shortenedUrl; // Assuming the API returns a field called 'shortenedUrl'
};

const router = Router();
const { subscriptions } = config;

const generateCode = () =>
  String(Math.floor(Math.random() * 1000000)).padStart(6, '0');

router.get(
  '/@me/daily',
  blockVpnProxy,
  [
    query('host')
      .trim()
      .notEmpty()
      .withMessage('Host is required')
      .isURL()
      .withMessage('Host must be a valid URL'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { host } = req.query;
      const { clientIp } = req;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ipRecord = await DailyIp.findOne({
        ip: clientIp,
      });
      if (ipRecord) {
        const lastClaimDate = new Date(ipRecord.updatedAt);
        lastClaimDate.setHours(0, 0, 0, 0);
        if (lastClaimDate.getTime() === today.getTime())
          return res.status(200).json({ dailyUrl: ipRecord.url });
      }
      const code = generateCode();
      const shortUrl = await generateShortURL(`${host}?dailyCode=${code}`);
      const redisClient = await getRedisClient();
      await redisClient.set(
        `tempCode:${clientIp}`,
        JSON.stringify({ code, expireTime: Date.now() + 15 * 60 * 1000 }),
        { EX: 900 } // 15 minutes
      );
      if (!ipRecord)
        await DailyIp.create({
          ip: clientIp,
          url: shortUrl,
        });
      else await ipRecord.updateOne({ url: shortUrl });
      res.status(200).json({ dailyUrl: shortUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
  }
);

router.get(
  '/verify-daily',
  [query('dailyCode').isInt(), validateRequest],
  async (req, res) => {
    try {
      const redisClient = await getRedisClient();
      const { dailyCode } = req.query;
      const { clientIp } = req;
      const entry = JSON.parse(await redisClient.get(`tempCode:${clientIp}`));
      if (!entry) return res.status(400).json({ error: 'لا توجد هدايا' });
      await redisClient.del(`tempCode:${clientIp}`);
      if (entry.code !== dailyCode)
        return res.status(400).json({ error: 'رمز غير صحيح' });
      if (Date.now() >= entry.expireTime)
        return res.status(400).json({ error: 'إنتهت المهلة جرب مرة آخرى غدا' });
      const dailyConfig = subscriptions[req.user.tier].features.tasks.daily;
      const daily =
        Math.floor(Math.random() * dailyConfig.limit) + dailyConfig.bonus;
      req.user.balance += daily;
      await req.user.save();
      return res.status(200).json({
        message: 'لقد حصلت على هديتك',
        daily,
      });
    } catch (error) {
      console.error(`Error in /verify-daily: ${error.message}`);
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
  }
);

export default router;
