import { Router } from 'express';
import { body, param } from 'express-validator';
import { Product, Trade } from '../../utils/schemas/traderSchema.js';
import config from '../../config.js';

const { subscriptions } = config;
const router = Router();

// Get all products
router.get('/products/', async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    const { slots, maxCoins } = subscriptions[req.user.tier].features.products;
    res.json({ products, plan: { slots, maxCoins } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في جلب المنتجات.' });
  }
});

// Get a single product
router.get('/products/:id', param('id').isMongoId(), async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!product) return res.status(404).json({ error: 'المنتج غير موجود.' });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في جلب المنتج.' });
  }
});

// Create a product
router.post(
  '/products/',
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('price').isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const count = await Product.countDocuments({ userId: req.user._id });
      const { slots, maxCoins } =
        subscriptions[req.user.tier].features.products;
      if (count >= slots)
        return res.status(400).json({ error: 'تجاوزت الحد الأقصى للمنتجات.' });
      if (req.body.price > maxCoins)
        return res
          .status(400)
          .json({ error: 'السعر يجب ان يكون اقل من او يساوي ' + maxCoins });
      const product = await Product.create({
        ...req.body,
        userId: req.user._id,
        openTrades: 0,
        isLocked: false,
      });
      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في إنشاء المنتج.' });
    }
  }
);

// Update a product
router.put(
  '/products/:id',
  [
    param('id').isMongoId(),
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('price').isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      if (
        req.body.price > subscriptions[req.user.tier].features.products.maxCoins
      )
        return res
          .status(400)
          .json({ error: 'السعر يجب ان يكون اقل من او يساوي ' + maxCoins });
      const product = await Product.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id, isLocked: false },
        req.body,
        { new: true }
      );
      if (!product)
        return res.status(404).json({ error: 'المنتج غير موجود أو مقفل.' });
      res.json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في تحديث المنتج.' });
    }
  }
);

// Delete a product
router.delete('/products/:id', param('id').isMongoId(), async (req, res) => {
  try {
    const result = await Product.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
      isLocked: false,
      openTrades: 0,
    });
    if (!result.deletedCount) {
      return res
        .status(404)
        .json({ error: 'المنتج غير موجود أو لديه صفقات مفتوحة.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في حذف المنتج.' });
  }
});

// Create a trade
router.post(
  '/trades/',
  [body('productId').isMongoId(), body('quantity').isInt({ min: 1 })],
  async (req, res) => {
    try {
      // Inside POST '/trades/' route
      const product = await Product.findById(req.body.productId);
      if (!product) return res.status(404).json({ error: 'المنتج غير موجود.' });
      const totalPrice = product.price * req.body.quantity;
      const trade = await Trade.create({
        productId: req.body.productId,
        buyerId: req.user._id,
        sellerId: product.userId,
        quantity: req.body.quantity,
        totalPrice: totalPrice,
        status: 'pending',
      });
      res.status(201).json(trade);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في إنشاء الصفقة.' });
    }
  }
);

// قبول الصفقة
router.put('/trades/:id/accept', param('id').isMongoId(), async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: 'الصفقة غير موجودة.' });

    // تحقق إذا كان المستخدم هو المشتري وحالة الصفقة "قيد الانتظار"
    if (
      trade.buyerId.toString() !== req.user._id.toString() ||
      trade.status !== 'pending'
    )
      return res.status(403).json({ error: 'ممنوع قبول هذه الصفقة.' });

    // تحديث حالة الصفقة إلى "مقبولة"
    trade.status = 'accepted';
    await trade.save();

    res.json(trade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في قبول الصفقة.' });
  }
});

// رفض الصفقة
router.put('/trades/:id/reject', param('id').isMongoId(), async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: 'الصفقة غير موجودة.' });

    // تحقق إذا كان المستخدم هو المشتري وحالة الصفقة "قيد الانتظار"
    if (
      trade.buyerId.toString() !== req.user._id.toString() ||
      trade.status !== 'pending'
    )
      return res.status(403).json({ error: 'ممنوع رفض هذه الصفقة.' });

    // تحديث حالة الصفقة إلى "مرفوضة"
    trade.status = 'rejected';
    await trade.save();

    res.json(trade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في رفض الصفقة.' });
  }
});

export default router;
