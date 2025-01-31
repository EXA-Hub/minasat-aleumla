// api/src/routes/auth/chat.js
import { Router } from 'express';
import { param, body } from 'express-validator';
import { validateRequest } from '../../utils/middleware/validateRequest.js';
import { Trade, Product } from '../../utils/schemas/traderSchema.js';
import { Chat } from '../../utils/schemas/chat.js';

const router = Router();

const chatMiddleware = async (req, res, next) => {
  try {
    const { tradeid } = req.params;
    const trade = await Trade.findById(tradeid);
    if (!trade) return res.status(404).json({ error: 'الدردشة غير موجودة' });
    let chat = await Chat.findOne({ trade: tradeid });
    if (!chat) chat = await Chat.create({ trade: tradeid });
    const isBuyer = trade.buyerId.toString() === req.user._id.toString();
    let isSeller = !isBuyer;
    if (isSeller)
      isSeller = await Product.exists({
        _id: trade.productId,
        userId: req.user._id,
      });
    if (!isBuyer && !isSeller)
      return res.status(404).json({ error: 'غير مصرح لك بالدردشة' });
    req.chat = chat;
    req.isBuyer = isBuyer;
    req.isSeller = isSeller;
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'حدث خطاء في جلب الدردشات' });
  }
  next();
};

router.get(
  '/chat/:tradeid',
  [
    param('tradeid').isMongoId().withMessage('المعرف غير صالح'),
    validateRequest,
  ],
  chatMiddleware,
  async (req, res) => {
    try {
      res.json(req.chat);
    } catch (error) {
      res.status(500).json({ error: 'حدث خطاء في جلب الدردشات' });
    }
  }
);

router.put(
  '/chat/:tradeid/send',
  [
    param('tradeid').isMongoId().withMessage('المعرف غير صالح'),
    body('message')
      .isString()
      .withMessage('الرسالة غير صالحة')
      .trim()
      .isLength({ min: 1, max: 100 }),
    validateRequest,
  ],
  chatMiddleware,
  async (req, res) => {
    try {
      const { message } = req.body;
      if (
        !(req.isBuyer && message.startsWith('المشتري:')) &
        !(req.isSeller && message.startsWith('البائع:'))
      )
        return res.status(400).json({ error: 'الرسالة غير صالحة' });
      req.chat.messages.push(message + '\n' + Date.now());
      await req.chat.save();
      res.sendStatus(200);
    } catch (error) {
      console.error('Error fetching chat:', error);
      res.status(500).json({ error: 'حدث خطاء في جلب الدردشات' });
    }
  }
);

export default router;
