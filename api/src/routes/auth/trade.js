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
  lock: 'يجب ادخال قيمة صحيحة',
};

const errorMessages = {
  productNotFound: 'المنتج غير موجود.',
  productsNotFound: 'لا يوجد منتجات.',
  tradeNotFound: 'الصفقة غير موجودة.',
  tradesNotFound: 'لا يوجد صفقات.',
  productLocked: 'المنتج مقفل.',
};

function requireAppWs(app, ws) {
  const router = Router();

  // Get all products
  router.get('/products/', async (req, res) => {
    try {
      const products = await Product.find({ userId: req.user._id });
      const { slots, maxCoins } =
        subscriptions[req.user.tier].features.products;
      res.json({ products, plan: { slots, maxCoins } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في جلب المنتجات.' });
    }
  });

  // Get a single product
  router.get(
    '/products/:id',
    [param('id').isMongoId().withMessage(validateMessages.id), validateRequest],
    async (req, res) => {
      try {
        const product = await Product.findOne({
          _id: req.params.id,
          userId: req.user._id,
        });
        if (!product)
          return res.status(404).json({ error: errorMessages.productNotFound });
        res.json(product);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في جلب المنتج.' });
      }
    }
  );

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
        const count = await Product.countDocuments({ userId: req.user._id });
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
        );
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
        res.status(204).send();
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
    '/trades',
    [
      body('productId').isMongoId().withMessage(validateMessages.id),
      body('quantity').isInt({ min: 1 }).withMessage(validateMessages.amount),
      validateRequest,
    ],
    async (req, res) => {
      try {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const product = await Product.findOneAndUpdate(
            { _id: req.body.productId, isLocked: false },
            { $inc: { openTrades: 1 } },
            { new: true, session }
          );
          if (!product) throw new Error('المنتج غير موجود. او مقفل');

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

          const trade = await Trade.create(
            [
              {
                productId: req.body.productId,
                quantity: req.body.quantity,
                buyerId: req.user._id,
              },
            ],
            { session }
          );

          await session.commitTransaction();
          res.status(201).json(trade[0]);
        } catch (error) {
          await session.abortTransaction();
          res.status(500).json({ error: error.message });
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
        await Product.updateOne(
          { _id: trade.productId },
          { $inc: { openTrades: -1 } }
        );
        await trade.deleteOne();
        res.status(200).json(trade);
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
        const trade = await Trade.findOneAndUpdate(
          {
            _id: req.params.id,
            stage: 'buyer_offered',
          },
          { stage: 'seller_accepted' },
          { new: true }
        );
        if (!trade)
          return res.status(404).json({ error: 'الصفقة غير موجودة.' });
        const product = await Product.exists({
          _id: trade.productId,
          userId: req.user._id,
        });
        if (!product)
          return res.status(404).json({ error: 'المنتج غير موجود.' });
        res.status(200).json(trade);
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
        const product = await Product.findOne({ _id: trade.productId });
        if (!product)
          return res.status(404).json({ error: 'المنتج غير موجود.' });
        const seller = await User.findOne({ _id: product.userId });
        if (!seller)
          return res.status(404).json({ error: 'البائع غير موجود.' });
        const sellerFee = subscriptions[seller.tier].features.wallet.fee;
        const buyerFee = subscriptions[req.user.tier].features.wallet.fee;
        const totalPrice = product.price * trade.quantity;
        const totalCost = totalPrice + Math.ceil((totalPrice * buyerFee) / 100);
        const sellerPayout =
          totalPrice - Math.ceil((totalPrice * sellerFee) / 100);
        if (req.user.balance < totalCost)
          return res.status(400).json({ error: 'رصيد غير كافٍ' });
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          req.user.balance -= totalCost;
          if (req.user.referralId) req.user.tax += totalCost / 2;
          req.user.transactionStats.totalReceived += sellerPayout;
          req.user.transactionStats.totalTransactions += 1;
          trade.stage = 'buyer_confirmed';
          seller.balance += sellerPayout;
          if (seller.referralId) seller.tax += sellerPayout / 2;
          seller.transactionStats.totalReceived += sellerPayout;
          seller.transactionStats.totalTransactions += 1;
          await req.user.save({ session });
          await trade.save({ session });
          await seller.save({ session });
          await session.commitTransaction();
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          session.endSession();
        }
        await ws.wss.sendNotification(
          'قام المشتري بتأكيد الإستلام 🛒',
          Date.now(),
          seller.username
        );
        res.status(200).json(trade);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في تاكيد الصفقة.' });
      }
    }
  );

  // get one product trades
  router.get(
    '/@me/products/:id/trades',
    [param('id').isMongoId().withMessage(validateMessages.id), validateRequest],
    async (req, res) => {
      try {
        const product = await Product.findOne({
          _id: req.params.id,
          userId: req.user._id,
        });
        if (!product) return res.status(403).json({ error: 'غير مصرح به' });
        const trades = await Trade.find({ productId: product._id });
        res.status(200).json(trades);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'فشل في جلب صفقات المنتج.' });
      }
    }
  );

  // get all my trades
  router.get('/@me/trades', async (req, res) => {
    try {
      const trades = await Trade.find({ buyerId: req.user._id });
      res.status(200).json(trades);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في جلب صفقاتي.' });
    }
  });

  // get all my product's trades
  router.get('/@me/products/trades', async (req, res) => {
    try {
      const products = await Product.find({ userId: req.user._id });
      const trades = await Trade.aggregate([
        { $match: { productId: { $in: products.map((p) => p._id) } } },
        { $group: { _id: '$productId', trades: { $push: '$$ROOT' } } },
      ]);
      const data = products.map((product) => ({
        product,
        trades: trades[product._id] || [],
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
