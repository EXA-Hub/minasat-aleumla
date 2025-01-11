import { Router } from 'express';
import config from '../../config.js';
import { body, param } from 'express-validator';
import mongoose from 'mongoose'; // Import Mongoose

const router = Router();
const { subscriptions } = config;

// Define the Code schema and model
const codeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Unique code
  plan: {
    type: String,
    required: true,
    enum: Object.keys(subscriptions), // Only valid plans allowed
  }, // Plan associated with the code
  createdAt: { type: Date, default: Date.now }, // When the code was created
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Code = mongoose.model('Code', codeSchema);

import { validateRequest } from '../../utils/middleware/validateRequest.js';

// Generate subscription codes
router.post(
  '/plan/generate-code',
  [
    body('plan').isIn(Object.keys(subscriptions)),
    body('quantity').optional().isInt({ min: 1 }),
    validateRequest,
  ],
  async (req, res) => {
    const { plan, quantity = 1 } = req.body;

    try {
      const subscription = subscriptions[plan];

      if (subscription.coins === 0)
        return res.status(400).json({ error: 'هذه الخطة لا تحتوي على رصيد' });

      const fee = subscriptions[req.user.tier].features.wallet.fee;
      const cost = quantity * subscription.coins;
      const totalCost = Math.ceil((cost * fee) / 100) + cost;

      if (req.user.balance < totalCost)
        return res.status(400).json({ error: 'رصيد غير كافٍ' });

      req.user.balance -= totalCost;
      await req.user.save();

      const codes = await Promise.all(
        Array.from({ length: quantity }, async () => {
          const code = await Code.create({
            code:
              `${plan}_` +
              Math.random().toString(36).substring(2, 10).toUpperCase(),
            plan,
            creator: req.user._id,
          });
          return code;
        })
      );

      res.json({
        message: 'تم إنشاء الرموز بنجاح',
        newBalance: req.user.balance,
        codes,
      });
    } catch (error) {
      if (error.code === 11000)
        return res
          .status(409)
          .json({ error: 'فشل إنشاء الكود، حاول مرة أخرى' });

      throw error;
    }
  }
);

// get all user codes
router.get('/plan/codes', async (req, res) => {
  try {
    const codes = await Code.find({ creator: req.user._id });
    res.json(codes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في جلب الكودات.' });
  }
});

// Claim a subscription code
router.post(
  '/plan/claim',
  [body('code').trim().notEmpty(), validateRequest],
  async (req, res) => {
    const { code } = req.body;

    const subscriptionCode = await Code.findOne({ code });
    if (!subscriptionCode)
      return res.status(404).json({ error: 'الرمز غير صالح' });

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Code.deleteOne({ code });
        req.user.subscribedAt = Date.now();
        req.user.tier = subscriptionCode.plan;
        await req.user.save();
      });

      res.json({
        message: 'تم تفعيل الخطة بنجاح',
        newTier: req.user.tier,
      });
    } finally {
      session.endSession();
    }
  }
);

// Subscribe to a plan
router.post(
  '/plan/subscribe/:plan',
  [param('plan').isIn(Object.keys(subscriptions)), validateRequest],
  async (req, res) => {
    const { plan } = req.params;
    const subscription = subscriptions[plan];

    if (req.user.tier === plan)
      return res.status(400).json({ error: 'انت بالفعل في هذه الخطة' });

    if (req.user.balance < subscription.coins)
      return res.status(400).json({ error: 'رصيد غير كافٍ' });

    req.user.balance -= subscription.coins;
    req.user.subscribedAt = Date.now();
    req.user.tier = plan;
    await req.user.save();

    res.json({
      message: 'تم الاشتراك بنجاح',
      newTier: plan,
      newBalance: req.user.balance,
    });
  }
);

// Cancel subscription
router.post('/plan/cancel', async (req, res) => {
  if (req.user.tier === 'free')
    return res.status(400).json({ error: 'انت بالفعل في الخطة المجانية' });

  req.user.tier = 'free';
  await req.user.save();

  res.json({
    message: 'تم إلغاء الاشتراك بنجاح',
    newTier: 'free',
  });
});

export default router;
