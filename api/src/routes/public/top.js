// api/src/routes/public/top.js
import { Router } from 'express';
import NodeCache from 'node-cache';
import User from '../../utils/schemas/mongoUserSchema.js';
import config from '../../config.js';

const router = Router();
const { badges: AllBadges } = config;
const cache = new NodeCache({ stdTTL: 1 * 60 * 60 });

router.get('/richest', async (req, res) => {
  try {
    const cacheKey = 'richest_users';
    const cachedData = cache.get(cacheKey);
    if (cachedData) return res.json(JSON.parse(cachedData));
    const richestUsers = await User.find({})
      .sort({ balance: -1 })
      .limit(100)
      .select('username balance profile.profilePicture');
    const response = { users: richestUsers };
    cache.set(cacheKey, JSON.stringify(response));
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في جلب أغنى المستخدمين.' });
  }
});

// Route to get all usernames of donators
router.get('/donators', async (req, res) => {
  try {
    const cachedData = cache.get('donators');
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
    cache.set('donators', JSON.stringify(response));

    // Send the response
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

export default router;
