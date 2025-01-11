// api/src/routes/public/top.js
import { Router } from 'express';
import User from '../../utils/schemas/mongoUserSchema.js';
import NodeCache from 'node-cache';

const router = Router();
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

export default router;
