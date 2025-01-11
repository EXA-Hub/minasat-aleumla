// my-api/src/routes/public/airdrop.js
import express from 'express';
import { param, body } from 'express-validator';
const router = express.Router();
import mongoose from 'mongoose';
import config from '../../config.js';
const { subscriptions } = config;

const giftSchema = new mongoose.Schema({
  title: String,
  coins: Number,
  usersClaimed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  max: Number,
  url: {
    required: false,
    type: String,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

// Post-save hook to check if max limit is hit
giftSchema.post('save', async function (doc) {
  if (doc.usersClaimed.length >= doc.max) {
    await Gifts.findByIdAndDelete(doc._id); // Delete the gift if max limit is reached
    console.log(`Gift ${doc._id} deleted because max limit was reached.`);
  }
});

const Gifts = mongoose.model('Gift', giftSchema);

// Get available airdrops with pagination
router.get('/airdrop', async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalGifts = await Gifts.countDocuments({
      $and: [
        { usersClaimed: { $ne: req.user._id } }, // Ensure user is not in the usersClaimed array
        { $expr: { $lt: [{ $size: '$usersClaimed' }, '$max'] } }, // Ensure max is not hit
      ],
    });

    // Get gifts with pagination
    const gifts = await Gifts.find({
      $and: [
        { usersClaimed: { $ne: req.user._id } }, // Ensure user is not in the usersClaimed array
        { $expr: { $lt: [{ $size: '$usersClaimed' }, '$max'] } }, // Ensure max is not hit
      ],
    })
      .select('title coins url max usersClaimed')
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform gifts data
    const formattedGifts = gifts.map((gift) => ({
      id: gift._id,
      title: gift.title,
      coins: gift.coins,
      url: gift.url,
      max: gift.max,
      claimed: gift.usersClaimed.includes(req.user._id),
      claimedCount: gift.usersClaimed.length,
    }));

    // Send response
    res.json({
      message: 'تم جلب الهدايا بنجاح',
      data: {
        gifts: formattedGifts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalGifts / limit),
          totalItems: totalGifts,
          itemsPerPage: limit,
        },
      },
    });

    // Clean up expired gifts
    await Gifts.deleteMany({
      $expr: { $gte: [{ $size: '$usersClaimed' }, '$max'] },
    });
  } catch (error) {
    console.error('Airdrop fetch error:', error);
    res.status(500).json({
      status: 'error',
      message: 'حدث خطأ أثناء جلب الهدايا',
    });
  }
});

import { validateRequest } from '../../utils/middleware/validateRequest.js';

// Existing route to claim a gift
router.post(
  '/@me/airdrop/:id',
  [
    param('id').isMongoId().withMessage('الرجاء إدخال معرف صالح للهدية'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const gift = await Gifts.findById(req.params.id);
      if (!gift) return res.status(404).json({ error: 'الهدية غير موجودة' });
      if (gift.usersClaimed.includes(req.user._id))
        return res
          .status(400)
          .json({ error: 'لقد حصلت على هذه الهدية بالفعل' });

      if (gift.usersClaimed.length >= gift.max)
        return res.status(400).json({ error: 'هذه الهدية منتهية' });

      gift.usersClaimed.push(req.user._id);
      await gift.save();

      req.user.balance += gift.coins;
      await req.user.save();

      res.json({ message: 'تم تقديم الهدية بنجاح' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'حدث خطأ أثناء تقديم الهدية' });
    }
  }
);

// New route to add a gift
router.post(
  '/airdrop/create',
  [
    body('title')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('يجب أن يكون عنوان الهدية بين 3 و 100 حرف'),
    body('coins')
      .isInt({ min: 1, max: 1000000 })
      .withMessage('يجب أن تكون قيمة العملات بين 1 و 1000000'),
    body('max')
      .isInt({ min: 1, max: 10000 })
      .withMessage('يجب أن يكون الحد الأقصى للمستخدمين بين 1 و 10000'),
    body('url').optional().isURL().withMessage('الرجاء إدخال رابط صالح'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { title, coins, max, url } = req.body;
      const { slots, maxCoins, maxUsers } =
        subscriptions[req.user.tier].features.airdrop;

      if (maxCoins < coins)
        return res.status(400).json({ error: 'قيمة العملات غير صحيحة' });

      if (maxUsers < max)
        return res
          .status(400)
          .json({ error: 'الحد الأقصى للمستخدمين غير صحيح' });

      const airdropCount = await Gifts.countDocuments({
        createdBy: req.user._id,
      });

      if (airdropCount >= slots)
        return res.status(400).json({ error: 'لقد استخدمت كل صلة هدية' });

      const cost = coins * max;
      const { fee } = subscriptions[req.user.tier].features.wallet;
      const feeAmount = Math.ceil((cost * fee) / 100);
      if (req.user.balance < feeAmount + cost)
        return res.status(400).json({ error: 'رصيد غير كافٍ' });
      req.user.balance -= feeAmount + cost;
      await req.user.save();

      // Create new gift
      const newGift = new Gifts({
        title,
        coins,
        max,
        url,
        usersClaimed: [],
        createdBy: req.user._id,
      });

      // Save the gift
      await newGift.save();

      res.status(201).json({
        message: 'تم إنشاء الهدية بنجاح',
        gift: {
          id: newGift._id,
          title: newGift.title,
          coins: newGift.coins,
          max: newGift.max,
          url: newGift.url,
        },
        balance: req.user.balance,
        totalCost: cost + feeAmount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الهدية' });
    }
  }
);

export default router;
