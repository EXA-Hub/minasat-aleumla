// my-api/src/routes/public/security.js
import argon2 from 'argon2';
import express from 'express';
import { body } from 'express-validator';
import getRedisClient from '../../utils/libs/redisClient.js';
import User from '../../utils/schemas/mongoUserSchema.js';
import { generateToken } from '../../utils/token-sys.js';
import mail from '../../utils/mail.js';

const router = express.Router();

import { validateRequest } from '../../utils/middleware/validateRequest.js';

// Update the /recovery/verify route to add backup code type
router.post(
  '/recovery/verify',
  [
    body('type').isIn(['email', 'phone', 'backupCode']),
    body('value').notEmpty(),
    body('username').isString().isLength({ min: 3 }).trim().notEmpty(),
    validateRequest,
  ],
  async (req, res) => {
    const { type, value, username } = req.body;
    // Special handling for backup codes
    if (type === 'backupCode') {
      const user = await User.findOne({ username });
      if (!user)
        return res.status(404).json({ error: 'لم يتم العثور على الحساب' });
      const isValidCode = await Promise.any(
        user.backupCodes.map((hash) =>
          argon2.verify(hash, value).then((result) => {
            if (result) return true; // Resolve with true if the code matches
            throw new Error('Invalid code'); // Reject if the code doesn't match
          })
        )
      ).catch(() => false);
      if (!isValidCode) return res.status(401).json({ error: 'رمز غير صالح' });
      // Store the verified backup code for later removal
      const redisClient = await getRedisClient();
      await redisClient.set(
        `recovery:${
          type === 'backupCode' ? `backupCode:${username}` : `${type}:${value}`
        }`,
        JSON.stringify({ code, expiresAt }),
        { EX: 300 }
      ); // 5 minutes TTL

      return res.json({ message: 'تم التحقق من الرمز' });
    }

    // Existing email/phone logic...
    const user = await User.findOne({
      username,
      [type === 'email' ? 'recoveryEmail' : 'recoveryPhone']: value,
    });

    if (!user)
      return res.status(404).json({ error: 'لم يتم العثور على الحساب' });

    const code = Math.random().toString().slice(2, 8);
    const key =
      type === 'backupCode' ? `backupCode:${username}` : `${type}:${value}`;
    const redisClient = await getRedisClient();
    await redisClient.set(
      `recovery:${key}`,
      JSON.stringify({ code, expiresAt }),
      { EX: 300 }
    ); // 5 minutes TTL

    try {
      mail.sendMail({
        to: value,
        subject: `رمز الاسترداد الخاص بـ ${user.username}`,
        html: `
          <div style="direction: rtl; font-family: Arial, sans-serif; text-align: right; color: #333;">
            <h2 style="color: #555;">رمز الاسترداد</h2>
            <p>مرحبًا،</p>
            <p>لقد تم إرسال رمز الاسترداد الخاص بـ <strong>${type}</strong>.</p>
            <p>رمز الاسترداد هو:</p>
            <h3 style="color: #007BFF; background: #F0F8FF; padding: 10px; border-radius: 5px; display: inline-block;">
              ${code}
            </h3>
            <p>تم إرسال هذا الرمز إلى: <strong>${value}</strong></p>
            <hr style="margin: 20px 0;">
            <p>إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.</p>
            <p>مع تحياتنا، منصة العملة</p>
            <p>فريق الدعم</p>
          </div>
        `,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: 'فشل إرسال رسالة بريد إلكتروني' });
    }

    res.json({ message: 'تم إرسال رمز التحقق' });
  }
);

// Update the /recovery/reset route to handle backup codes
router.post(
  '/recovery/reset',
  [
    body('type').isIn(['email', 'phone', 'backupCode']),
    body('value').notEmpty(),
    body('code').custom((value, { req }) => {
      // Skip validation for backup codes
      if (req.body.type === 'backupCode') return true;
      // Otherwise enforce 6-digit code
      return /^\d{6}$/.test(value);
    }),
    body('newPassword').isStrongPassword(),
    body('username').isString().isLength({ min: 3 }).trim().notEmpty(),
    validateRequest,
  ],
  async (req, res) => {
    const { type, value, code, newPassword, username } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.status(404).json({ error: 'لم يتم العثور على الحساب' });
    if (type === 'backupCode') {
      const redisClient = await getRedisClient();
      const storedCode = await redisClient.get(`recovery:${key}`);
      if (
        !storedCode ||
        storedCode.code !== value ||
        storedCode.expiresAt < Date.now()
      )
        return res
          .status(401)
          .json({ error: 'رمز غير صالح أو منتهي الصلاحية' });

      // Remove the used backup code
      user.backupCodes = user.backupCodes.filter(async (hash) => {
        const isMatch = await argon2.verify(hash, value);
        return !isMatch;
      });
    } else {
      const key =
        type === 'backupCode' ? `backupCode:${username}` : `${type}:${value}`;
      const storedCode = await redisClient.get(`recovery:${key}`);
      if (
        !storedCode ||
        storedCode.code !== code ||
        storedCode.expiresAt < Date.now()
      )
        return res
          .status(401)
          .json({ error: 'رمز غير صالح أو منتهي الصلاحية' });
    }

    // Update password and token
    user.password = await argon2.hash(newPassword);
    user.token = generateToken(
      user.username,
      user._id.toString(),
      user.password
    );
    user.twoFactorEnabled = false;
    await user.save();

    // Remove recovery code from Redis
    const redisClient = await getRedisClient();
    await redisClient.del(
      `recovery:${
        type === 'backupCode' ? `backupCode:${username}` : `${type}:${value}`
      }`
    );

    res.json({
      message: 'تم تغيير كلمة المرور بنجاح, مع إلغاء المصادقة الثنائية',
    });
  }
);

export default router;
