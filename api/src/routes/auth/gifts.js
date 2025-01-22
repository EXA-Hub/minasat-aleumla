import mongoose from 'mongoose';
import { Router } from 'express';
import { body } from 'express-validator';
import getRedisClient from '../../utils/libs/redisClient.js';
import config from '../../config.js';

const { subscriptions } = config;

const MysteryGiftSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  winnersCount: { type: Number, default: 1 }, // Number of winners
  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of winners
  attempts: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  claimedAt: { type: Date },
  status: { type: String, enum: ['active', 'claimed'], default: 'active' },
});

// Set TTL index on claimedAt
MysteryGiftSchema.index({ claimedAt: 1 }, { expireAfterSeconds: 86400 });

const MysteryGift = mongoose.model('MysteryGift', MysteryGiftSchema);
import { validateRequest } from '../../utils/middleware/validateRequest.js';
function requireAppWs(_app, ws) {
  const router = Router();

  router.post(
    '/@me/mystery-gift',
    [
      body('amount').isNumeric().isFloat({ gt: 0 }),
      body('code').isString().isLength({ min: 1, max: 30 }),
      body('winnersCount').isInt({ min: 1 }), // Validate number of winners
      validateRequest,
    ],
    async (req, res) => {
      const { amount, code, winnersCount } = req.body;
      const creator = req.user;

      // TODO validate gifts plan
      const { slots, maxCoins, maxUsers } =
        subscriptions[creator.tier].features.gifts;

      if (winnersCount > maxUsers)
        return res
          .status(400)
          .json({ error: 'الحد الأقصى للمستخدمين هو ' + maxUsers });

      if (amount > maxCoins)
        return res
          .status(400)
          .json({ error: 'الحد الأقصى للمبلغ هو ' + maxCoins });
      const redisClient = await getRedisClient();
      const exists = await redisClient.exists(`gift:${code}`);
      if (exists) return res.status(400).json({ error: 'الكود مستخدم مسبقاً' });

      const giftsCount = await MysteryGift.find({
        creator: req.user._id,
      }).countDocuments();

      if (slots <= giftsCount)
        return res.status(400).json({
          error: 'الحد الآقصى للهدايا هو ' + slots,
        });

      try {
        const feeAmount = Math.ceil(
          (amount * subscriptions[creator.tier].features.wallet.fee) / 100
        );
        const totalAmount = (amount + feeAmount) * winnersCount;
        if (creator.balance < totalAmount)
          return res.status(400).json({ error: 'رصيد غير كافٍ' });
        creator.balance -= totalAmount;
        creator.transactionStats.totalSpent += totalAmount;
        if (creator.referralId) creator.tax += Math.floor(feeAmount / 2);
        await creator.save();

        const gift = new MysteryGift({
          code,
          amount,
          feeAmount,
          winnersCount, // Save number of winners
          creator: creator._id,
        });
        await gift.save();
        const redisClient = await getRedisClient();
        await redisClient.set(`gift:${code}`, JSON.stringify(gift), {
          EX: 3600,
        }); // 1 hour TTL

        res.json({
          amount,
          feeAmount,
          remainingBalance: creator.balance,
        });
      } catch (error) {
        console.error(error);
        if (error.code === 11000)
          return res.status(400).json({ error: 'الكود مستخدم مسبقاً' });
        res.status(500).json({ error: 'خطأ في الخادم' });
      }
    }
  );

  router.post(
    '/mystery-gift/try',
    [body('code').isString().isLength({ max: 30 }), validateRequest],
    async (req, res) => {
      const { code } = req.body;
      const user = req.user;

      try {
        const redisClient = await getRedisClient();
        let gift = await redisClient.get(`gift:${code}`);
        if (!gift) {
          gift = await MysteryGift.findOne({ code, status: 'active' });
          if (gift)
            await redisClient.set(`gift:${code}`, JSON.stringify(gift), {
              EX: 3600,
            });
        }

        if (!gift || gift.status !== 'active') {
          return res.status(404).json({ error: 'الكود غير صالح' });
        }

        if (gift.creator.equals(user._id)) {
          return res.status(400).json({ error: 'لا يمكنك المشاركة في هديتك' });
        }

        if (gift.attempts.some((a) => a.user.equals(user._id))) {
          return res.status(400).json({ error: 'لقد حاولت مسبقاً' });
        }

        gift.attempts.push({ user: user._id });

        if (code === gift.code) {
          gift.winners.push(user._id); // Add user to winners array
          if (gift.winners.length >= gift.winnersCount) {
            gift.status = 'claimed';
            gift.claimedAt = new Date();
          }
          user.balance += gift.amount;
          user.transactionStats.totalReceived += gift.amount;
          await user.save();
          const redisClient = await getRedisClient();
          await redisClient.del(`gift:${code}`);

          await ws.wss.sendNotification(
            'تم ربح هديتك! 🎁',
            Date.now(),
            (
              await gift.populate('creator')
            ).creator.username
          );
        }

        await gift.save();

        res.json({
          success: gift.status === 'claimed',
          amount: gift.status === 'claimed' ? gift.amount : undefined,
          newBalance: gift.status === 'claimed' ? user.balance : undefined,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'خطأ في الخادم' });
      }
    }
  );

  router.get('/@me/mystery-gifts', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const gifts = await MysteryGift.find({ creator: req.user._id })
        .sort({ createdAt: -1 }) // Sort by createdAt in descending order
        .skip(skip) // Apply skip for pagination
        .limit(limit) // Apply limit for pagination
        .populate('winners', 'username') // Populate the 'winners' array
        .populate('attempts.user', 'username'); // Populate the 'attempts.user' field

      const total = await MysteryGift.countDocuments({ creator: req.user._id }); // Get total count of gifts

      res.json({
        gifts: gifts.map((g) => ({
          code: g.code,
          amount: g.amount,
          status: g.status,
          winners: g.winners.map((winner) => winner.username), // Include usernames of winners
          attempts: g.winnersCount, // Include number of attempts
          createdAt: g.createdAt, // Include creation date
        })),
        pagination: {
          page, // Current page number
          limit, // Number of items per page
          total, // Total number of gifts
          hasMore: skip + limit < total, // Check if there are more items to fetch
        },
        plan: subscriptions[req.user.tier].features.gifts, // Include the user's gift plan details
      });
    } catch (error) {
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
  });

  return router;
}

export default requireAppWs;
