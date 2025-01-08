// my-api/src/routes/auth/wallet.js
import { Router } from 'express';
import {
  getUserTransactions,
  logTransaction,
} from '../../utils/schemas/transactionLogger.js';
import { body, validationResult, param } from 'express-validator';
import User from '../../utils/schemas/mongoUserSchema.js'; // Path to your MongoDB user model
import config from '../../config.js';

const { maxSendingAmount } = config;

function requireAppWs(_app, ws) {
  const router = Router();
  const findUser = async (user) => {
    return user.match(/^[0-9a-fA-F]{24}$/)
      ? await User.findById(user)
      : await User.findOne({ username: user });
  };

  // Example route inside /auth
  router.post(
    '/@me/wallet',
    // Validation middleware
    [
      body('recipient')
        .isString()
        .withMessage(
          'يجب أن يكون المستلم عبارة عن نص (إما المعرّف أو اسم المستخدم)'
        )
        .optional(),
      body('amount')
        .isNumeric()
        .withMessage('يجب أن يكون المبلغ رقماً')
        .isFloat({ gt: 0, lt: maxSendingAmount })
        .withMessage(
          'يجب أن يكون المبلغ أكبر من صفر وأقل من ' + maxSendingAmount
        ),
      body('description')
        .isString()
        .optional()
        .isLength({ max: 255 })
        .withMessage('يجب أن لا يتجاوز الوصف 255 حرفاً'),
      body('payFee')
        .isBoolean()
        .withMessage('يجب أن يكون payFee قيمة منطقية (Boolean)'),
    ],
    async (req, res) => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

      const { recipient, amount, description, payFee } = req.body;
      const { _id, fee } = req.user; // Assuming req.user contains the current user's details

      try {
        // Find recipient user (by username or MongoDB ID)
        const recipientUser = await findUser(recipient);

        if (!recipientUser)
          return res.status(404).json({ error: 'المستلم غير موجود' });

        // Calculate the fee and amount to pay
        const feeAmount = Math.ceil((amount * fee) / 100);
        let taking = payFee ? amount + feeAmount : amount;
        let giving = payFee ? amount : amount - feeAmount;

        // Check if the sender has enough balance
        const sender = req.user;

        if (sender.balance < taking)
          return res.status(400).json({ error: 'رصيد غير كافٍ' });

        if (sender._id.equals(recipientUser._id))
          return res
            .status(400)
            .json({ error: 'لا يمكن إرسال الأموال إلى نفسك' });

        // Update sender's balance
        sender.balance -= taking;
        sender.transactionStats.totalSpent += taking;
        sender.transactionStats.totalTransactions += 1;
        if (sender.referralId) sender.tax += Math.floor(feeAmount / 2);
        await sender.save();

        // Update recipient's balance
        recipientUser.balance += giving; // Recipient gets the original amount
        recipientUser.transactionStats.totalReceived += giving;
        recipientUser.transactionStats.totalTransactions += 1;
        if (recipientUser.referralId)
          recipientUser.tax += Math.floor(feeAmount / 2);
        await recipientUser.save();

        await ws.wss.sendNotification(
          'تم إستلام تحويل جديد 💸',
          Date.now(),
          recipientUser.username
        );

        // Log the transaction
        await logTransaction({
          sender,
          recipient: recipientUser,
          amount,
          description,
          feeAmount,
          payerPaidFee: payFee,
        });

        // Send success response
        res.send({
          recipient: recipientUser.username,
          amount,
          description,
          payFee,
          _id,
          feeAmount,
          remainingBalance: sender.balance,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'خطأ في الخادم' });
      }
    }
  );

  // Use a regex to capture the user parameter correctly
  router.get(
    '/@:user/wallet',
    [
      param('user')
        .isString()
        .withMessage('يجب أن يكون اسم المستخدم نصًا')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('يجب أن يحتوي اسم المستخدم على أحرف وأرقام فقط'),
    ],
    async (req, res) => {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
      const user = req.params.user; // Capture the username from the URL
      try {
        // Find the user by username
        const userInfo = user === 'me' ? req.user : await findUser(user);
        if (!userInfo)
          return res.status(404).json({ error: 'لا يوجد مستخدم بهذا الإسم' });
        if (!userInfo.privacy.showWallet && userInfo._id !== req.user._id)
          return res.status(403).json({ error: 'المحفظة خاصة' });
        const { username, balance, fee, _id } = userInfo;
        // Send the user's wallet information
        res.json({ username, balance, fee, _id });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
      }
    }
  );

  // In wallet.js, add this route:
  router.get('/@me/transactions', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      const userInfo = req.user;

      const transactions = await getUserTransactions(userInfo._id, {
        limit,
        skip,
      });

      res.json({
        transactions,
        pagination: {
          page,
          limit,
          hasMore: transactions.length === limit,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  router.get('/@me/overview', async (req, res) => {
    try {
      res.json(req.user.transactionStats);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  return router;
}

export default requireAppWs;
