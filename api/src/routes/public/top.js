// api/src/routes/public/top.js
import { Router } from 'express';
import User from '../../utils/schemas/mongoUserSchema.js';
import getRedisClient from '../../utils/libs/redisClient.js';
import config from '../../config.js';

const router = Router();
const { badges: AllBadges } = config;

router.get('/richest', async (req, res) => {
  try {
    const redisClient = await getRedisClient();
    const cachedData = await redisClient.get('richest_users');
    if (cachedData) return res.json(JSON.parse(cachedData));

    const response = {
      users: await User.find({
        'privacy.showProfile': true,
        'privacy.showWallet': true,
      })
        .sort({ balance: -1 })
        .limit(100)
        .select('username balance profile.profilePicture'),
    };

    await redisClient.set('richest_users', JSON.stringify(response), {
      EX: 3600,
    });
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في جلب أغنى المستخدمين.' });
  }
});

// Route to get all usernames of donators
router.get('/donators', async (req, res) => {
  try {
    const redisClient = await getRedisClient();
    const cachedData = await redisClient.get('donators');
    if (cachedData) return res.json(JSON.parse(cachedData));

    // Define the badge names for donators
    const badge = AllBadges[3].name;

    // Find users who have either the silver or gold badge
    const donators = await User.find(
      { badges: { $in: [AllBadges[2].name, badge] } }, // Filter by specific badges
      { username: 1, _id: 0, badges: 1 } // Only return the 'username' field, exclude '_id'
    );

    const response = donators.map(({ username, badges }) => ({
      [username]: badges.includes(badge),
    }));

    // Cache the response
    await redisClient.set('donators', JSON.stringify(response), {
      EX: 3600,
    });

    // Send the response
    res.json(response);
  } catch (error) {
    console.error('Error fetching richest users:', error);
    res.status(500).json({ error: 'فشل في جلب أغنى المستخدمين.' });
  }
});

export default router;
