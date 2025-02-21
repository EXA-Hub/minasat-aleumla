import { Router } from 'express';
import { param } from 'express-validator';
import { validateRequest } from '../../utils/middleware/validateRequest.js';
import { Product } from '../../utils/schemas/traderSchema.js';
import Engagement from '../../utils/schemas/engagements.js';
import User from '../../utils/schemas/mongoUserSchema.js';
import config from '../../config.js';

const { badges, subscriptions } = config;

function requireAppWs(_app, ws) {
  const router = Router();

  // Middleware to validate user input and fetch user
  const fetchUser = async (req, res, next) => {
    try {
      const user = await User.findOne({ username: req.params.user });
      if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
      // Attach the user to the request object for use in the route handler
      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطآ في الخادم' });
    }
  };

  // Middleware to check profile privacy
  const checkProfilePrivacy = (req, res, next) => {
    if (!req.user.privacy.showProfile)
      return res.status(403).json({ error: 'الملف الشخصي خاص' });

    next();
  };

  // Middleware to check wallet privacy
  const checkWalletPrivacy = (req, res, next) => {
    if (!req.user.privacy.showWallet)
      return res.status(403).json({ error: 'المحفظة خاصة' });

    next();
  };

  // Common input validation for all routes
  const userValidation = [
    param('user')
      .isString()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/),
    validateRequest,
  ];

  // Get user products
  router.get(
    '/@:user/products',
    userValidation,
    fetchUser,
    checkProfilePrivacy,
    async (req, res) => {
      try {
        const products = await Product.find({ userId: req.user._id }).select(
          '_id price name openTrades isLocked'
        );
        res.json(products);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في جلب المنتجات.' });
      }
    }
  );

  // Middleware to log profile views
  const logProfileView = async (req, res, next) => {
    try {
      const targetUserId = req.user._id; // The user whose profile is being viewed
      const token = req.headers['authorization']?.split(' ')[1];

      await Engagement.create({
        viewerId: token && (await User.findOne({ token }))._id,
        userId: targetUserId, // The user whose profile is being viewed
      });

      next();
    } catch (error) {
      console.error('Error logging profile view:', error);
      next();
    }
  };

  // Update the profile route to log profile views
  router.get(
    '/@:user/profile',
    userValidation,
    fetchUser,
    checkProfilePrivacy,
    logProfileView, // Add this middleware
    async (req, res) => {
      try {
        res.json({
          profile: req.user.profile,
          online: ws.clients.has(req.user.username),
          badges: [
            ...badges.map((badge) =>
              req.user.badges.includes(badge.name) ? badge : null
            ),
            badges.find((badge) => req.user.tier === badge.tier),
          ].filter(Boolean),
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'خطآ في الخادم' });
      }
    }
  );

  router.get(
    '/@:user/products/:productId',
    userValidation,
    fetchUser,
    checkProfilePrivacy,
    [
      param('productId').isMongoId().withMessage('معرف المنتج غير صالح.'),
      validateRequest,
    ],
    async (req, res) => {
      try {
        const { productId } = req.params; // The product being viewed
        const targetUserId = req.user._id; // The user who owns the product

        const product = await Product.findOne({
          _id: productId,
          userId: targetUserId,
        });

        if (!product)
          return res.status(404).json({ error: 'المنتج غير موجود' });

        res.json({ product, user: req.user.profile });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'حدث خطأ أثناء معالجة طلبك.' });
      }
    }
  );

  // Get user wallet
  router.get(
    '/@:user/wallet',
    userValidation,
    fetchUser,
    checkWalletPrivacy,
    async (req, res) => {
      try {
        const { username, balance, tier, _id } = req.user;
        res.json({
          username,
          balance,
          fee: subscriptions[tier].features.wallet.fee,
          _id,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'خطآ في الخادم' });
      }
    }
  );

  return router;
}

export default requireAppWs;
