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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

const dailyProviders = new Map([
  [
    1,
    {
      name: 'linkjust.com',
      period: 24 * 60 * 60 * 1000,
      API_KEY: process.env.LINKJUST_API_KEY,
      gift: (tier) => subscriptions[tier].features.tasks.daily,
    },
  ],
  [
    2,
    {
      name: 'nitro-link.com',
      period: 24 * 60 * 60 * 1000,
      API_KEY: process.env.NITRO_LINK_API_KEY,
      gift: (tier) => subscriptions[tier].features.tasks.daily2,
    },
  ],
  [
    3,
    {
      name: 'yallashort.com',
      period: 24 * 60 * 60 * 1000,
      API_KEY: process.env.YALLASHORT_API_KEY,
      gift: (tier) => subscriptions[tier].features.tasks.daily,
    },
  ],
  [
    4,
    {
      name: 'x-short.pro',
      period: 24 * 60 * 60 * 1000,
      API_KEY: process.env.X_SHORT_API_KEY,
      gift: (tier) => subscriptions[tier].features.tasks.daily,
    },
  ],
]);

const generateShortURL = async (url, provider, expirationMinutes = 15) => {
  const currentTime = new Date();
  currentTime.setMinutes(currentTime.getMinutes() + expirationMinutes); // Add expiration time

  const expiration = {
    year: currentTime.getUTCFullYear(),
    month: currentTime.getUTCMonth() + 1, // Months are 0-indexed
    day: currentTime.getUTCDate(),
    hour: currentTime.getUTCHours(),
    minute: currentTime.getUTCMinutes(),
  };

  const apiUrl = `https://${provider.name}/api?api=${
    provider.API_KEY
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
    console.error(response);
    throw new Error(
      `Failed to generate short URL: ${response.message}\n${response.status}`
    );
  }

  const data = await response.json();
  // console.log(data); // for debugging
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
      .isIn([...dailyProviders.keys()])
      .withMessage('ID is not valid'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const [host, id] = [req.query.host, parseInt(req.query.id)];
      const { clientIp } = req;
      const ipRecord = await DailyIp.findOne({
        identifier: `${id}-${clientIp}`,
      });
      const provider = dailyProviders.get(id);
      if (!provider) throw new Error(`Provider ${id} not found`);
      if (
        ipRecord &&
        ipRecord.updatedAt > new Date(Date.now() - provider.period)
      )
        return res.status(200).json({ dailyUrl: ipRecord.url });
      const code = generateCode();
      const shortUrl = await generateShortURL(
        `${host}?dailyCode=${code}&id=${id}`,
        provider
      );
      const redisClient = await getRedisClient();
      await redisClient.set(
        `tempCode:${id}-${clientIp}`,
        JSON.stringify({ code, expireTime: Date.now() + 15 * 60 * 1000 }),
        { EX: 900 } // 15 minutes
      );
      // console.log(`${host}?dailyCode=${code}&id=${id}`, shortUrl); // Only for debugging
      if (
        !ipRecord ||
        ipRecord.updatedAt <
          new Date(Date.now() - (provider.period + 24 * 60 * 60 * 1000))
      ) {
        if (ipRecord) await ipRecord.deleteOne();
        await DailyIp.create({
          identifier: `${id}-${clientIp}`,
          user: req.user._id,
          url: shortUrl,
        });
      } else await ipRecord.updateOne({ url: shortUrl });
      res.status(200).json({ dailyUrl: shortUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
  }
);

router.get(
  '/verify-daily',
  [
    query('dailyCode').isInt(),
    query('id')
      .isInt()
      .isIn([...dailyProviders.keys()]),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const redisClient = await getRedisClient();
      const { dailyCode, id } = req.query;
      const { clientIp } = req;
      const entry = JSON.parse(
        await redisClient.get(`tempCode:${id}-${clientIp}`)
      );
      if (!entry)
        return res.status(400).json({ error: 'ليس لديك هدايا حاليا' });
      await redisClient.del(`tempCode:${id}-${clientIp}`);
      if (entry.code !== dailyCode)
        return res.status(400).json({ error: 'رمز غير صحيح' });
      if (Date.now() >= entry.expireTime)
        return res.status(400).json({ error: 'إنتهت المهلة جرب مرة آخرى غدا' });
      const dailyConfig = dailyProviders.get(parseInt(id)).gift(req.user.tier);
      const daily =
        Math.floor(Math.random() * dailyConfig.limit) + dailyConfig.bonus;
      req.user.balance += daily;
      await req.user.save();
      return res.status(200).json({
        message: 'لقد حصلت على هديتك',
        daily,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
  }
);

// Add these new routes at the end of tasks.js
router.get('/streaks/daily', async (req, res) => {
  try {
    const streaks = await DailyIp.aggregate([
      {
        $group: {
          _id: '$user', // Group by user
          dates: {
            $addToSet: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }, // Convert dates to YYYY-MM-DD format
            },
          },
        },
      },
      {
        $addFields: {
          sortedDates: {
            $sortArray: {
              input: {
                $map: {
                  input: '$dates',
                  as: 'dateStr',
                  in: { $dateFromString: { dateString: '$$dateStr' } }, // Convert back to date objects for sorting
                },
              },
              sortBy: 1, // Sort dates in ascending order
            },
          },
        },
      },
      {
        $addFields: {
          streak: {
            $reduce: {
              input: '$sortedDates', // Iterate through sorted dates
              initialValue: { current: 1, max: 1, prev: null }, // Initialize streak tracking
              in: {
                $let: {
                  vars: {
                    diffDays: {
                      $divide: [
                        { $subtract: ['$$this', '$$value.prev'] }, // Calculate difference between current and previous date
                        86400000, // Convert milliseconds to days
                      ],
                    },
                  },
                  in: {
                    current: {
                      $cond: {
                        if: { $eq: ['$$value.prev', null] }, // If it's the first date, start with streak = 1
                        then: 1,
                        else: {
                          $cond: {
                            if: { $eq: ['$$diffDays', 1] }, // If the difference is 1 day, increment streak
                            then: { $add: ['$$value.current', 1] },
                            else: 1, // Otherwise, reset streak to 1
                          },
                        },
                      },
                    },
                    max: {
                      $max: [
                        '$$value.max', // Track the maximum streak
                        {
                          $cond: {
                            if: { $eq: ['$$diffDays', 1] }, // If the difference is 1 day, update max streak
                            then: { $add: ['$$value.current', 1] },
                            else: 1, // Otherwise, reset max streak to 1
                          },
                        },
                      ],
                    },
                    prev: '$$this', // Set the current date as the previous date for the next iteration
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          user: '$_id', // Include user ID
          streak: '$streak.max', // Include the maximum streak
          _id: 0, // Exclude the default _id field
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData',
          pipeline: [
            {
              $match: {
                'privacy.showProfile': true,
              },
            },
            {
              $project: {
                username: 1,
                'profile.profilePicture': 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                _id: '$userData._id',
                username: '$userData.username',
                profile: '$userData.profile',
                streak: '$streak',
              },
              '$userData',
            ],
          },
        },
      },
      { $sort: { streak: -1 } }, // Sort by streak in descending order
      { $limit: 50 }, // Limit to top 50 users
    ]);

    res.status(200).json(streaks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/streaks/on-fire', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of today
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of today

    const streaks = await DailyIp.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay }, // Filter entries created today
        },
      },
      {
        $group: {
          _id: '$user', // Group by user
          dates: {
            $addToSet: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }, // Convert dates to YYYY-MM-DD format
            },
          },
        },
      },
      {
        $addFields: {
          sortedDates: {
            $sortArray: {
              input: {
                $map: {
                  input: '$dates',
                  as: 'dateStr',
                  in: { $dateFromString: { dateString: '$$dateStr' } }, // Convert back to date objects for sorting
                },
              },
              sortBy: 1, // Sort dates in ascending order
            },
          },
        },
      },
      {
        $addFields: {
          streak: {
            $reduce: {
              input: '$sortedDates', // Iterate through sorted dates
              initialValue: { current: 1, max: 1, prev: null }, // Initialize streak tracking
              in: {
                $let: {
                  vars: {
                    diffDays: {
                      $divide: [
                        { $subtract: ['$$this', '$$value.prev'] }, // Calculate difference between current and previous date
                        86400000, // Convert milliseconds to days
                      ],
                    },
                  },
                  in: {
                    current: {
                      $cond: {
                        if: { $eq: ['$$value.prev', null] }, // If it's the first date, start with streak = 1
                        then: 1,
                        else: {
                          $cond: {
                            if: { $eq: ['$$diffDays', 1] }, // If the difference is 1 day, increment streak
                            then: { $add: ['$$value.current', 1] },
                            else: 1, // Otherwise, reset streak to 1
                          },
                        },
                      },
                    },
                    max: {
                      $max: [
                        '$$value.max', // Track the maximum streak
                        {
                          $cond: {
                            if: { $eq: ['$$diffDays', 1] }, // If the difference is 1 day, update max streak
                            then: { $add: ['$$value.current', 1] },
                            else: 1, // Otherwise, reset max streak to 1
                          },
                        },
                      ],
                    },
                    prev: '$$this', // Set the current date as the previous date for the next iteration
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          user: '$_id', // Include user ID
          streak: '$streak.max', // Include the maximum streak
          _id: 0, // Exclude the default _id field
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData',
          pipeline: [
            {
              $match: {
                'privacy.showProfile': true,
              },
            },
            {
              $project: {
                username: 1,
                'profile.profilePicture': 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$userData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                _id: '$userData._id',
                username: '$userData.username',
                profile: '$userData.profile',
                streak: '$streak',
              },
              '$userData',
            ],
          },
        },
      },
      { $sort: { streak: -1 } }, // Sort by streak in descending order
      { $limit: 50 }, // Limit to top 50 users
    ]);

    res.status(200).json(streaks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

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
