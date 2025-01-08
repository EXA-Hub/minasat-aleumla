import { Router } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import NodeCache from 'node-cache';
import config from '../../config.js';

const { subscriptions } = config;
const giftCache = new NodeCache({ stdTTL: 3600 });

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

function requireAppWs(_app, ws) {
  const router = Router();

  router.post(
    '/@me/mystery-gift',
    [
      body('amount').isNumeric().isFloat({ gt: 0 }),
      body('code').isString().isLength({ min: 1, max: 30 }),
      body('winnersCount').isInt({ min: 1 }), // Validate number of winners
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { amount, code, winnersCount } = req.body;
      const creator = req.user;

      try {
        const feeAmount = Math.ceil(
          (amount * subscriptions[creator.tier].features.wallet.fee) / 100
        );
        const totalAmount = (amount + feeAmount) * winnersCount; // Calculate total amount including fee for all winners

        if (creator.balance < totalAmount) {
          return res.status(400).json({ error: 'رصيد غير كافٍ' });
        }

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
        giftCache.set(code, gift);

        res.json({
          amount,
          feeAmount,
          remainingBalance: creator.balance,
        });
      } catch (error) {
        console.error(error);
        if (error.code === 11000) {
          return res.status(400).json({ error: 'الكود مستخدم مسبقاً' });
        }
        res.status(500).json({ error: 'خطأ في الخادم' });
      }
    }
  );

  router.post(
    '/mystery-gift/try',
    [body('code').isString().isLength({ max: 30 })],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { code } = req.body;
      const user = req.user;

      try {
        let gift = giftCache.get(code);
        if (!gift) {
          gift = await MysteryGift.findOne({ code, status: 'active' });
          if (gift) giftCache.set(code, gift);
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
          giftCache.del(code);

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
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('winners', 'username') // Populate the 'winners' array instead of 'winner'
        .populate('attempts.user', 'username');

      const total = await MysteryGift.countDocuments({ creator: req.user._id });

      res.json({
        gifts: gifts.map((g) => ({
          code: g.code,
          amount: g.amount,
          status: g.status,
          winners: g.winners.map((winner) => winner.username), // Include usernames of winners
          attempts: g.attempts.length,
          createdAt: g.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + gifts.length < total,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
  });

  return router;
}

export default requireAppWs;
