// api/src/routes/auth/donate.js
import { Router } from 'express';
import { param } from 'express-validator';
import { validateRequest } from '../../utils/middleware/validateRequest.js';
import config from '../../config.js';

const router = Router();
const { badges } = config;

router.post(
  '/@me/donate/:amount',
  [
    param('amount')
      .isNumeric()
      .withMessage('يجب ان يكون المبلغ رقم')
      .toInt() // Convert amount to an integer
      .isInt({ min: 0 }) // Validate that the amount is an integer >= 0
      .withMessage('يجب أن يكون المبلغ أكبر من أو يساوي 0'),
    validateRequest,
  ],
  async (req, res) => {
    const { amount } = req.params;

    // Check if the user has sufficient balance
    if (req.user.balance < amount)
      return res.status(400).json({ error: 'رصيدك غير كافي' });

    try {
      // Determine the badge based on the donation amount
      let badge;
      if (amount > 100000) badge = badges[3];
      else if (amount > 10000) badge = badges[2];

      // Deduct the amount from the user's balance
      req.user.balance -= amount;
      if (badge && !req.user.badges.includes(badge.name))
        req.user.badges.push(badge.name);
      await req.user.save(); // Save the updated user balance

      // Send the response
      res.json({
        newBalance: req.user.balance,
        badge, // Provide a default message if no badge is assigned
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطآ في الخادم' });
    }
  }
);

export default router;
