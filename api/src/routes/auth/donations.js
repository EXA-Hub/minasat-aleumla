// my-api/src/routes/auth/donations.js
import express from 'express';
import User from '../../utils/schemas/mongoUserSchema.js';
import { param } from 'express-validator';

const router = express.Router();

// Get donation page settings
router.get('/@me/donations', async (req, res) => {
  try {
    res.json(req.user.donationPage);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب إعدادات صفحة التبرعات' });
  }
});

// Update donation page settings
router.put('/@me/donations', async (req, res) => {
  try {
    const { title, minAmount, customAmounts, enabled } = req.body;
    const { user } = req;

    user.donationPage = {
      ...user.donationPage,
      title: title || user.donationPage.title,
      minAmount: minAmount || user.donationPage.minAmount,
      customAmounts: customAmounts || user.donationPage.customAmounts,
      enabled: enabled !== undefined ? enabled : user.donationPage.enabled,
    };

    await user.save();
    res.json(user.donationPage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'خطأ في تحديث إعدادات صفحة التبرعات' });
  }
});

import { validateRequest } from '../../utils/middleware/validateRequest.js';

// Get public donation page
router.get(
  '/tip/:username',
  [
    param('username')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('Username can only contain letters and numbers.'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username }).select(
        'username donationPage'
      );

      if (!user || !user.donationPage?.enabled)
        return res.status(404).json({ error: 'صفحة التبرعات غير متوفرة' });

      res.json({
        username: user.username,
        donationPage: user.donationPage,
      });
    } catch (error) {
      res.status(500).json({ error: 'خطأ في جلب صفحة التبرعات' });
    }
  }
);

export default router;
