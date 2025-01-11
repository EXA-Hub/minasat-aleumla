// api/src/routes/auth/cheque.js
import { Router } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import NodeCache from 'node-cache';
import config from '../../config.js';

const { subscriptions } = config;
const chequeCache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

const ChequeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feeAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  claimedAt: { type: Date },
  description: { type: String, maxlength: 255 },
  status: { type: String, enum: ['active', 'claimed'], default: 'active' },
});

// Set TTL index on claimedAt
ChequeSchema.index({ claimedAt: 1 }, { expireAfterSeconds: 86400 });

const Cheque = mongoose.model('Cheque', ChequeSchema);

function requireAppWs(_app, ws) {
  const router = Router();

  // Create cheque
  router.post(
    '/@me/cheque',
    [
      body('amount')
        .isNumeric()
        .withMessage('يجب أن يكون المبلغ رقماً')
        .isFloat({ gt: 0 }),
      body('description').optional().isString().isLength({ max: 255 }),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { amount, description } = req.body;
      const creator = req.user;

      const { slots, maxCoins } = subscriptions[creator.tier].features.cheque;

      if (amount > maxCoins) {
        return res.status(400).json({
          error: `الحد الأقصى للمبلغ هو ${
            subscriptions[creator.tier].features.wallet.minAmount
          }`,
        });
      }
      const chequesCount = await Cheque.find({
        creator: req.user._id,
      }).countDocuments();
      if (slots <= chequesCount) {
        return res.status(400).json({ error: 'تم تجاوز حد الشيكات' });
      }

      try {
        const feeAmount = Math.ceil(
          (amount * subscriptions[creator.tier].features.wallet.fee) / 100
        );
        const totalAmount = amount + feeAmount;

        if (creator.balance < totalAmount) {
          return res.status(400).json({ error: 'رصيد غير كافٍ' });
        }

        // Generate unique code
        const code = Math.random().toString(36).substring(2, 15);

        // Update creator's balance
        creator.balance -= totalAmount;
        creator.transactionStats.totalSpent += totalAmount;
        creator.transactionStats.totalTransactions += 1;
        if (creator.referralId) creator.tax += Math.floor(feeAmount / 2);
        await creator.save();

        const cheque = new Cheque({
          code,
          amount,
          creator: creator._id,
          feeAmount,
          description,
        });
        await cheque.save();

        chequeCache.set(code, cheque);

        res.json({
          code,
          amount,
          feeAmount,
          description,
          remainingBalance: creator.balance,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'خطأ في الخادم' });
      }
    }
  );

  // Claim cheque
  router.post(
    '/cheque/claim',
    [body('code').isString().isLength({ min: 6, max: 13 })],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { code } = req.body;
      const recipient = req.user;

      try {
        // Check cache first
        let cheque = chequeCache.get(code);
        if (!cheque) {
          cheque = await Cheque.findOne({ code, status: 'active' });
          if (cheque) chequeCache.set(code, cheque);
        }

        if (!cheque || cheque.status !== 'active') {
          return res.status(404).json({ error: 'الشيك غير صالح أو مستخدم' });
        }

        if (cheque.creator.equals(recipient._id)) {
          return res.status(400).json({ error: 'لا يمكن صرف الشيك الخاص بك' });
        }

        // Update recipient's balance
        recipient.balance += cheque.amount;
        recipient.transactionStats.totalReceived += cheque.amount;
        recipient.transactionStats.totalTransactions += 1;
        await recipient.save();

        // Update cheque status
        cheque.status = 'claimed';
        cheque.recipient = recipient._id;
        cheque.claimedAt = new Date();
        await cheque.save();

        // Invalidate cache
        chequeCache.del(code);

        // Send notification
        await ws.wss.sendNotification(
          'تم صرف الشيك الخاص بك 💸',
          Date.now(),
          (
            await cheque.populate('creator')
          ).creator.username
        );

        res.json({
          amount: cheque.amount,
          description: cheque.description,
          newBalance: recipient.balance,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'خطأ في الخادم' });
      }
    }
  );

  // Get user's cheques
  router.get('/@me/cheques', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const cheques = await Cheque.find({ creator: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('recipient', 'username');

      const total = await Cheque.countDocuments({ creator: req.user._id });

      res.json({
        cheques: cheques.map((c) => ({
          code: c.code,
          amount: c.amount,
          feeAmount: c.feeAmount,
          status: c.status,
          description: c.description,
          recipient: c.recipient?.username,
          createdAt: c.createdAt,
        })),
        pagination: {
          page,
          limit,
          total,
          hasMore: skip + cheques.length < total,
        },
        plan: subscriptions[req.user.tier].features.cheque,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
  });

  return router;
}

export default requireAppWs;
