import { Router } from 'express';

const router = Router();

// Show profile route
router.get('/@me/profile', async (req, res) => {
  try {
    res.json(req.user.profile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// Edit profile route
router.put('/@me/profile', async (req, res) => {
  try {
    const { profilePicture, wallpaper } = req.user.profile;
    req.user.profile = { ...req.body, profilePicture, wallpaper };
    await req.user.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

export default router;
