// api/src/routes/auth/trade.js
import mongoose from 'mongoose';
import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../../utils/middleware/validateRequest.js';
import { Product, Trade } from '../../utils/schemas/traderSchema.js';
import User from '../../utils/schemas/mongoUserSchema.js';
import config from '../../config.js';

const { subscriptions } = config;

const validateMessages = {
  name: 'الاسم مطلوب',
  description: 'الوصف مطلوب',
  price: 'السعر يجب ان يكون اقل من او يساوي 0',
  id: 'معرف المنتج غير صالح',
  lock: 'يجب ادخال قيمة بوليانية صحيحة',
  amount: 'يجب ادخال قيمة صحيحة (0 - 50)',
};

function requireAppWs(app, ws) {
  const router = Router();

  // Get all products
  router.get('/products/', async (req, res) => {
    try {
      const products = await Product.find({ userId: req.user._id }).select(
        '-commentsAndRatings'
      );
      const { slots, maxCoins } =
        subscriptions[req.user.tier].features.products;
      res.json({ products, plan: { slots, maxCoins } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في جلب المنتجات.' });
    }
  });

  // Create a product
  router.post(
    '/products/',
    [
      body('name').trim().notEmpty().withMessage(validateMessages.name),
      body('description')
        .trim()
        .notEmpty()
        .withMessage(validateMessages.description),
      body('price').isInt({ min: 0 }).withMessage(validateMessages.price),
      validateRequest,
    ],
    async (req, res) => {
      try {
        const count = await Product.countDocuments({
          userId: req.user._id,
        }).select('-commentsAndRatings');
        const { slots, maxCoins } =
          subscriptions[req.user.tier].features.products;
        if (count >= slots)
          return res
            .status(400)
            .json({ error: 'تجاوزت الحد الأقصى للمنتجات.' });
        if (req.body.price > maxCoins)
          return res
            .status(400)
            .json({ error: 'السعر يجب ان يكون اقل من او يساوي ' + maxCoins });
        const product = await Product.create({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          userId: req.user._id,
          openTrades: 0,
          isLocked: true,
        });
        res.status(201).json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في إنشاء المنتج.' });
      }
    }
  );

  // must locked and no open trades
  // Update a product
  router.put(
    '/products/:id',
    [
      param('id').isMongoId().withMessage(validateMessages.id),
      body('name').trim().notEmpty().withMessage(validateMessages.name),
      body('description')
        .trim()
        .notEmpty()
        .withMessage(validateMessages.description),
      body('price').isInt({ min: 0 }).withMessage(validateMessages.price),
      validateRequest,
    ],
    async (req, res) => {
      try {
        if (
          req.body.price >
          subscriptions[req.user.tier].features.products.maxCoins
        )
          return res.status(400).json({
            error:
              'السعر يجب ان يكون اقل من او يساوي ' +
              subscriptions[req.user.tier].features.products.maxCoins,
          });
        const product = await Product.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: req.user._id,
            openTrades: 0,
            isLocked: true,
          },
          {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
          },
          { new: true }
        ).select('-commentsAndRatings');
        if (!product)
          return res
            .status(404)
            .json({ error: 'المنتج غير موجود أو مقفل. أو لديه صفقات مفتوحة.' });
        res.json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في تحديث المنتج.' });
      }
    }
  );

  // must locked and no open trades
  // Delete a product
  router.delete(
    '/products/:id',
    [param('id').isMongoId().withMessage(validateMessages.id), validateRequest],
    async (req, res) => {
      try {
        const result = await Product.deleteOne({
          _id: req.params.id,
          userId: req.user._id,
          isLocked: true,
          openTrades: 0,
        });
        if (!result.deletedCount)
          return res.status(404).json({
            error: 'المنتج غير موجود أو لديه صفقات مفتوحة. او غير مقفل',
          });
        res.sendStatus(204);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في حذف المنتج.' });
      }
    }
  );

  // must no open trades
  // lock a product
  router.put(
    '/products/:id/lock',
    [
      param('id').isMongoId().withMessage(validateMessages.id),
      body('lock').isBoolean().withMessage(validateMessages.lock),
      validateRequest,
    ],
    async (req, res) => {
      try {
        const product = await Product.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: req.user._id,
            openTrades: 0,
          },
          { isLocked: req.body.lock },
          { new: true }
        );
        if (!product)
          return res
            .status(404)
            .json({ error: 'المنتج غير موجود أو لديه صفقات مفتوحة.' });
        res.status(200).send(req.body.lock);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في قفل المنتج.' });
      }
    }
  );

  // must not locked
  // create a trade
  router.post(
    '/trades/create',
    [
      body('productId').isMongoId().withMessage(validateMessages.id),
      body('quantity')
        .isInt({ min: 1, max: 50 })
        .withMessage(validateMessages.amount),
      validateRequest,
    ],
    async (req, res) => {
      try {
        const product = await Product.findOne({
          _id: req.body.productId,
          isLocked: false,
        }).select('price userId isLocked openTrades');
        if (!product)
          return res.status(404).json({ error: 'المنتج غير موجود. او مقفل' });
        if (req.user._id.equals(product.userId))
          return res
            .status(400)
            .json({ error: 'لا يمكنك إنشاء صفقة بالمنتج الخاص بك' });
        if (
          req.user.balance <
          Math.ceil(
            (product.price *
              req.body.quantity *
              subscriptions[req.user.tier].features.wallet.fee) /
              100
          ) +
            product.price * req.body.quantity
        )
          return res.status(400).json({ error: 'رصيد غير كافٍ' });
        const session = await mongoose.startSession();
        try {
          session.startTransaction();
          await Trade.create(
            [
              {
                productId: req.body.productId,
                quantity: req.body.quantity,
                buyerId: req.user._id,
              },
            ],
            { session }
          );
          product.openTrades += 1;
          await product.save({ session });
          await session.commitTransaction();
          res.sendStatus(200);
        } catch (error) {
          console.error(error);
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في انشاء الصفقة.' });
      }
    }
  );

  // seller cancel trade
  router.delete(
    '/trades/:id/cancel',
    [param('id').isMongoId().withMessage(validateMessages.id), validateRequest],
    async (req, res) => {
      try {
        const trade = await Trade.findOne({
          _id: req.params.id,
          stage: 'buyer_offered',
        });
        if (!trade)
          return res.status(404).json({ error: 'الصفقة غير موجودة.' });
        const product = await Product.exists({
          _id: trade.productId,
          userId: req.user._id,
        });
        if (!product)
          return res.status(404).json({ error: 'المنتج غير موجود.' });
        const session = await mongoose.startSession();
        try {
          session.startTransaction();
          await Product.updateOne(
            { _id: trade.productId },
            { $inc: { openTrades: -1 } },
            { session }
          );
          await trade.deleteOne({ session });
          await session.commitTransaction();
          res.sendStatus(200);
        } catch (error) {
          console.error('Error during transaction:', error);
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في الغاء الصفقة.' });
      }
    }
  );

  // seller accept trade
  router.put(
    '/trades/:id',
    [param('id').isMongoId().withMessage(validateMessages.id), validateRequest],
    async (req, res) => {
      try {
        const trade = await Trade.findOne({
          _id: req.params.id,
          stage: 'buyer_offered',
        });
        if (!trade)
          return res.status(404).json({ error: 'الصفقة غير موجودة.' });
        const product = await Product.findOne({
          _id: trade.productId,
          userId: req.user._id,
        }).select('-commentsAndRatings');
        if (!product)
          return res.status(404).json({ error: 'المنتج غير موجود.' });
        const buyer = await User.findOne({ _id: trade.buyerId });
        if (!buyer)
          return res.status(404).json({ error: 'المشتري غير موجود.' });
        const totalPrice = product.price * trade.quantity;
        const totalFee = Math.ceil(
          (totalPrice * subscriptions[buyer.tier].features.wallet.fee) / 100
        );
        const totalCost = totalPrice + totalFee;
        if (buyer.balance < totalCost)
          return res.status(400).json({ error: 'رصيد المشتري غير كافٍ' });
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          buyer.balance -= totalCost;
          if (buyer.referralId) buyer.tax += totalFee / 2;
          buyer.transactionStats.totalPayout += totalCost;
          buyer.transactionStats.totalTransactions += 1;
          trade.stage = 'seller_accepted';
          await trade.save({ session });
          await buyer.save({ session });
          await session.commitTransaction();
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
        await ws.wss.sendNotification(
          'قام البائع بقبول الصفقة 🛒',
          Date.now(),
          buyer.username
        );
        res.sendStatus(200);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في قبول الصفقة.' });
      }
    }
  );

  // buyer confirm trade
  router.put(
    '/trades/:id/confirm',
    [param('id').isMongoId().withMessage(validateMessages.id), validateRequest],
    async (req, res) => {
      try {
        const trade = await Trade.findOne({
          _id: req.params.id,
          stage: 'seller_accepted',
          buyerId: req.user._id,
        });
        if (!trade)
          return res.status(404).json({ error: 'الصفقة غير موجودة.' });
        const product = await Product.findOne({ _id: trade.productId }).select(
          '-commentsAndRatings'
        );
        if (!product)
          return res.status(404).json({ error: 'المنتج غير موجود.' });
        const seller = await User.findOne({ _id: product.userId });
        if (!seller)
          return res.status(404).json({ error: 'البائع غير موجود.' });
        trade.stage = 'buyer_confirmed';
        await trade.save();
        await ws.wss.sendNotification(
          'قام المشتري بتأكيد الإستلام 🛒',
          Date.now(),
          seller.username
        );
        res.sendStatus(200);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في تاكيد الصفقة.' });
      }
    }
  );

  // get all my trades
  router.get('/@me/trades', async (req, res) => {
    try {
      const trades = await Trade.find({ buyerId: req.user._id });

      // Collect unique product IDs
      const productIds = new Set();
      for (const t of trades) {
        if (t.productId) productIds.add(t.productId);
      }

      // Fetch product details
      const products = await Product.find({
        _id: { $in: [...productIds] },
      }).select('-commentsAndRatings -description');

      // Create product map and collect unique seller IDs
      const productsMap = new Map();
      const sellerIds = new Set();

      for (const p of products) {
        productsMap.set(p._id.toString(), p);
        if (p.userId) sellerIds.add(p.userId);
      }

      const sellerMap = new Map(
        (
          await User.find({
            _id: { $in: [...sellerIds] },
          })
            .select('username profile.profilePicture privacy.showProfile _id')
            .lean()
        )
          .map(({ _id, username, profile, privacy }) => ({
            _id,
            username,
            profilePicture: privacy?.showProfile
              ? profile?.profilePicture
              : null,
          }))
          .map((s) => [s._id.toString(), s])
      );

      // Map trades to response format
      const data = trades.map((t) => ({
        ...t._doc,
        seller: sellerMap.get(
          productsMap.get(t.productId?.toString())?.userId?.toString()
        ),
        product: productsMap.get(t.productId?.toString()),
      }));

      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في جلب صفقاتي.' });
    }
  });

  // get all my product's trades
  router.get('/@me/products/trades', async (req, res) => {
    try {
      const products = await Product.find({ userId: req.user._id }).select(
        '-commentsAndRatings -description'
      );

      // Extract product IDs efficiently
      const productIds = products.map((p) => p._id);

      // Aggregate trades grouped by productId
      const trades = await Trade.aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: '$productId', trades: { $push: '$$ROOT' } } },
      ]);

      // Collect buyer IDs from trades
      const buyerIds = new Set();
      for (const t of trades) {
        for (const trade of t.trades) {
          if (trade.buyerId) buyerIds.add(trade.buyerId);
        }
      }

      const buyerMap = new Map(
        (
          await User.find({
            _id: { $in: [...buyerIds] },
          })
            .select('username profile.profilePicture privacy.showProfile _id')
            .lean()
        )
          .map(({ _id, username, privacy, profile }) => ({
            _id,
            username,
            profilePicture: privacy?.showProfile
              ? profile?.profilePicture
              : null,
          }))
          .map((b) => [b._id.toString(), b])
      );

      // Map trades by productId
      const tradesMap = new Map(
        trades.map((t) => [
          t._id.toString(),
          t.trades.map((trade) => ({
            ...trade,
            buyer: buyerMap.get(trade.buyerId.toString()) || null, // Add buyer object
          })),
        ])
      );

      // Format response
      const data = products.map((product) => ({
        product,
        trades: tradesMap.get(product._id.toString()) || [],
      }));

      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في جلب صفقات المنتج.' });
    }
  });

  return router;
}

export default requireAppWs;
