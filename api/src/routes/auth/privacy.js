import { Router } from 'express';

const router = Router();

// POST route to update privacy settings
router.put('/@me/privacy', async (req, res) => {
  try {
    req.user.privacy = req.body;
    await req.user.save();
    res.json(req.user.privacy);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'خطآ في الخادم' });
  }
});

// GET route to retrieve privacy settings
router.get('/@me/privacy', (req, res) => {
  res.json(req.user.privacy);
});

export default router;
