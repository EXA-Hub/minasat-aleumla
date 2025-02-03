// api/src/routes/public/top.js
import { Router } from 'express';
import User from '../../utils/schemas/mongoUserSchema.js';
import config from '../../config.js';

const router = Router();
const { badges: AllBadges } = config;

router.get('/richest', async (req, res) => {
  try {
    res.json({
      users: await User.find({
        'privacy.showProfile': true,
        'privacy.showWallet': true,
      })
        .sort({ balance: -1 })
        .limit(100)
        .select('username balance profile.profilePicture'),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في جلب أغنى المستخدمين.' });
  }
});

// Route to get all usernames of donators
router.get('/donators', async (req, res) => {
  try {
    const badge = AllBadges[3].name;
    res.json(
      (
        await User.find(
          { badges: { $in: [AllBadges[2].name, badge] } }, // Filter by specific badges
          { username: 1, _id: 0, badges: 1 } // Only return the 'username' field, exclude '_id'
        )
      ).map(({ username, badges }) => ({
        [username]: badges.includes(badge),
      }))
    );
  } catch (error) {
    console.error('Error fetching richest users:', error);
    res.status(500).json({ error: 'فشل في جلب أغنى المستخدمين.' });
  }
});

export default router;
