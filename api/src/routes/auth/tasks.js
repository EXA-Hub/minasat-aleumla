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
    identifier: {
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

const generateShortURL = async (url, id, expirationMinutes = 15) => {
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() + expirationMinutes); // Add expiration time

  const expiration = {
    year: currentTime.getUTCFullYear(),
    month: currentTime.getUTCMonth() + 1, // Months are 0-indexed
    day: currentTime.getUTCDate(),
    hour: currentTime.getUTCHours(),
    minute: currentTime.getUTCMinutes(),
  };

  const apiUrl = `https://${
    id === 1 ? 'linkjust.com' : 'nitro-link.com'
  }/api?api=${
    id === 1 ? process.env.LINKJUST_API_KEY : process.env.NITRO_LINK_API_KEY
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
    query('id')
      .isInt()
      .withMessage('ID must be an integer')
      .isIn([1, 2])
      .withMessage('ID must be 1 or 2'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const [host, id] = [req.query.host, parseInt(req.query.id)];
      const { clientIp } = req;
      const ipRecord = await DailyIp.findOne({
        identifier: `${id}-${clientIp}`,
      });
      if (
        ipRecord &&
        ((id === 1 &&
          ipRecord.updatedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
          (id === 2 &&
            ipRecord.updatedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)))
      )
        return res.status(200).json({ dailyUrl: ipRecord.url });
      const code = generateCode();
      const shortUrl = await generateShortURL(
        `${host}?dailyCode=${code}&id=${id}`,
        id
      );
      const redisClient = await getRedisClient();
      await redisClient.set(
        `tempCode:${id}-${clientIp}`,
        JSON.stringify({ code, expireTime: Date.now() + 15 * 60 * 1000 }),
        { EX: 900 } // 15 minutes
      );
      if (!ipRecord)
        await DailyIp.create({
          identifier: `${id}-${clientIp}`,
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
  [query('dailyCode').isInt(), query('id').isInt(), validateRequest],
  async (req, res) => {
    try {
      const redisClient = await getRedisClient();
      const { dailyCode, id } = req.query;
      const { clientIp } = req;
      const entry = JSON.parse(
        await redisClient.get(`tempCode:${id}-${clientIp}`)
      );
      if (!entry)
        return res.status(400).json({ error: 'إنتهت المهلة جرب مرة آخرى غدا' });
      await redisClient.del(`tempCode:${id}-${clientIp}`);
      if (entry.code !== dailyCode)
        return res.status(400).json({ error: 'رمز غير صحيح' });
      if (Date.now() >= entry.expireTime)
        return res.status(400).json({ error: 'إنتهت المهلة جرب مرة آخرى غدا' });
      const dailyConfig =
        id === 1
          ? subscriptions[req.user.tier].features.tasks.daily
          : subscriptions[req.user.tier].features.tasks.daily2;
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

// Helper function to validate environment variables
function validateEnv(variableName) {
  const value = process.env[variableName];
  if (!value) throw new Error(`${variableName} is not set`);
  return value;
}

// Helper function to create an invite link
async function createInviteLink(botToken, channelUsername, memberCount = 1) {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/createChatInviteLink`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelUsername,
        expire_date: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours from now
        member_limit: memberCount,
        creates_join_request: false,
      }),
    }
  );
  const data = await response.json();
  if (!response.ok)
    throw new Error(`Failed to create invite link: ${data.description}`);
  return data.result.invite_link;
}

// Helper function to check membership status
async function checkMembership(botToken, channelUsername, userId) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${channelUsername}&user_id=${userId}`
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.description);
    return data.result.status;
  } catch (error) {
    console.error(
      `Error checking membership for user ${userId}:`,
      error.message
    );
    return null; // Indicate failure
  }
}

// Route handler
router.get('/@me/task/telegram', async (req, res) => {
  try {
    // Validate environment variables
    const botToken = validateEnv('TELEGRAM_BOT_TOKEN');
    const channelUsername = validateEnv('TELEGRAM_CHANNEL_USERNAME');

    // Retrieve Telegram accounts for the user
    const telegramAccounts = req.user.apps?.Telegram || [];

    // Create invite link
    const inviteLink = await createInviteLink(
      botToken,
      channelUsername,
      telegramAccounts.length || 1
    );

    // If no accounts are linked, return early
    if (telegramAccounts.length === 0)
      return res.json({
        message: 'ليس لديك حسابات تليجرام',
        inviteLink,
      });

    // Check membership status for each account
    const accountsWithStatus = await Promise.all(
      telegramAccounts.map(async (account) => {
        const status = await checkMembership(
          botToken,
          channelUsername,
          account.id
        );
        return {
          id: account.id,
          name: account.name,
          avatar: account.photo_url,
          status,
        };
      })
    );

    // Return the result
    res.json({
      accounts: accountsWithStatus,
      inviteLink,
    });
  } catch (error) {
    console.error('Telegram API Error:', error);
    res.status(500).json({
      error: 'خطأ في الخادم',
    });
  }
});

import { DiscordAPI } from '../bots/discord/discordApi.js';
const discordApi = DiscordAPI.getInstance();

router.get('/@me/task/discord', async (req, res) => {
  const channelId = validateEnv('DISCORD_CHANNEL_ID');
  discordApi
    .createInvite(channelId)
    .then((inviteLinkData) => {
      res.json({
        inviteLink: `https://discord.com/invite/${inviteLinkData.code}`,
      });
    })
    .catch((error) => {
      console.error('Discord API Error:', error);
      res.status(500).json({
        error: 'خطاء في الخادم',
      });
    });
});

export default router;
