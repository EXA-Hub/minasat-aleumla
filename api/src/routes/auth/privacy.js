import { Router } from 'express';
import { Product } from '../../utils/schemas/traderSchema.js';

const router = Router();

// POST route to update privacy settings
router.put('/@me/privacy', async (req, res) => {
  try {
    const ownsProduct = await Product.exists({ userId: req.user._id });
    if (ownsProduct)
      return res
        .status(400)
        .json({ error: 'لا يمكن تغيير الخصوصية لوجود منتجات' });
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
