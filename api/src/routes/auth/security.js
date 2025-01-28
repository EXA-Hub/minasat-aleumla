import argon2 from 'argon2';
import express from 'express';
import { authenticator } from 'otplib';
import { body } from 'express-validator';
import User from '../../utils/schemas/mongoUserSchema.js';
import { generateToken } from '../../utils/token-sys.js';
import mail from '../../utils/mail.js';

const router = express.Router();

router.get('/@me/security/settings', async (req, res) => {
  try {
    const user = req.user;
    res.json({
      twoFactorEnabled: user.twoFactorEnabled || false,
      recoveryEmail: user.recoveryEmail || '',
      recoveryPhone: user.recoveryPhone || '',
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الإعدادات' });
  }
});

import { validateRequest } from '../../utils/middleware/validateRequest.js';

router.post(
  '/@me/security/password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isStrongPassword(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error('كلمات المرور غير متطابقة');
      return true;
    }),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const user = req.user;
      const isValid = await argon2.verify(
        user.password,
        req.body.currentPassword
      );

      if (!isValid)
        return res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة' });

      const hashedPassword = await argon2.hash(req.body.newPassword);
      user.password = hashedPassword;

      const newToken = generateToken(
        user.username,
        user._id.toString(),
        hashedPassword
      );
      user.token = newToken;
      await user.save();

      res.json({
        message: 'تم تحديث كلمة المرور بنجاح. الرجاء إعادة تسجيل الدخول.',
        requireRelogin: true,
      });
    } catch (error) {
      res.status(500).json({ error: 'حدث خطأ أثناء تحديث كلمة المرور' });
    }
  }
);

router.post(
  '/@me/security/username',
  [
    body('newUsername').isLength({ min: 3 }),
    body('password').notEmpty(),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const isValid = await argon2.verify(user.password, req.body.password);

      if (!isValid)
        return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });

      if (
        await User.exists({
          username: req.body.newUsername,
        })
      )
        return res.status(400).json({ error: 'اسم المستخدم مستخدم بالفعل' });

      user.username = req.body.newUsername;

      const newToken = generateToken(
        req.body.newUsername,
        user._id.toString(),
        user.password
      );
      user.token = newToken;
      await user.save();

      res.json({
        message: 'تم تحديث اسم المستخدم بنجاح. الرجاء إعادة تسجيل الدخول.',
        requireRelogin: true,
      });
    } catch (error) {
      res.status(500).json({ error: 'حدث خطأ أثناء تحديث اسم المستخدم' });
    }
  }
);

import getRedisClient from '../../utils/libs/redisClient.js';

router.post(
  '/@me/security/verify',
  [
    body('action').isIn(['2fa', 'email', 'phone']),
    body('type').isIn(['setup', 'verify', 'disable']),
    body('value').optional(),
    body('token').optional(),
  ],
  async (req, res) => {
    const { action, type, value, token } = req.body;
    const userId = req.user._id.toString();

    try {
      switch (action) {
        case '2fa':
          if (type === 'setup') {
            if (req.user.twoFactorEnabled) {
              return res
                .status(400)
                .json({ error: 'المصادقة الثنائية مفعلة بالفعل' });
            }
            const secret = authenticator.generateSecret();
            const otpauth = authenticator.keyuri(
              req.user.username,
              'منصة العملة',
              secret
            );
            const redisClient = await getRedisClient();
            await redisClient.set(
              `tempVerification:${userId}`,
              JSON.stringify({ secret }),
              { EX: 300 }
            ); // 5 minutes TTL
            return res.json({ otpauth, secret });
          } else if (type === 'verify') {
            const tempData = await redisClient.get(
              `tempVerification:${userId}`
            );
            if (!tempData || !tempData.secret) {
              return res
                .status(400)
                .json({ error: 'يرجى إعداد المصادقة الثنائية أولاً' });
            }
            const isValid = authenticator.verify({
              token,
              secret: tempData.secret,
            });
            if (!isValid) {
              return res.status(400).json({ error: 'رمز غير صالح' });
            }
            req.user.twoFactorSecret = tempData.secret;
            req.user.twoFactorEnabled = true;
            await req.user.save();
            const redisClient = await getRedisClient();
            await redisClient.del(`tempVerification:${userId}`);
            return res.json({ enabled: true });
          } else if (type === 'disable') {
            if (!req.user.twoFactorEnabled) {
              return res
                .status(400)
                .json({ error: 'المصادقة الثنائية معطلة بالفعل' });
            }
            const isValid = authenticator.verify({
              token,
              secret: req.user.twoFactorSecret,
            });
            if (!isValid) {
              return res.status(400).json({ error: 'رمز غير صالح' });
            }
            req.user.twoFactorSecret = undefined;
            req.user.twoFactorEnabled = false;
            await req.user.save();
            return res.json({ enabled: false });
          }
          break;

        case 'email':
          if (type === 'setup') {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
              return res
                .status(400)
                .json({ error: 'إستخدم بريد إلكتروني حقيقي' });
            const verificationCode = Math.floor(
              100000 + Math.random() * 900000
            ).toString();
            const redisClient = await getRedisClient();
            await redisClient.set(
              `tempVerification:${userId}`,
              JSON.stringify({
                email: value,
                code: verificationCode,
              }),
              { EX: 300 }
            ); // 5 minutes TTL
            try {
              mail.sendMail({
                to: value,
                subject: `رمز الإعداد الخاص بـ ${req.user.username}`,
                html: `
                  <div style="direction: rtl; font-family: Arial, sans-serif; text-align: right; color: #333;">
                    <h2 style="color: #555;">رمز الإعداد الخاص بك</h2>
                    <p>مرحبًا،</p>
                    <p>لقد طلبت رمز استرداد لإجراء: <strong>${action}</strong>.</p>
                    <p>رمز الإعداد الخاص بك هو:</p>
                    <h3 style="color: #007BFF; background: #F0F8FF; padding: 10px; border-radius: 5px; display: inline-block;">
                      ${verificationCode}
                    </h3>
                    <p>تم إرسال هذا الرمز إلى: <strong>${value}</strong></p>
                    <hr style="margin: 20px 0;">
                    <p>إذا لم تطلب رمز الإعداد هذا، يرجى تجاهل هذه الرسالة.</p>
                    <p>مع تحياتنا، منصة العملة</p>
                    <p>فريق الدعم</p>
                  </div>
                `,
              });
            } catch (e) {
              console.log(e);
              return res
                .status(500)
                .json({ error: 'فشل إرسال رسالة بريد إلكتروني' });
            }
            return res.json({
              message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
            });
          } else if (type === 'verify') {
            const redisClient = await getRedisClient();
            const tempData = await redisClient.get(
              `tempVerification:${userId}`
            );
            if (!tempData || token !== tempData.code)
              return res.status(400).json({ error: 'رمز غير صالح' });
            req.user.recoveryEmail = tempData.email;
            await req.user.save();

            await redisClient.del(`tempVerification:${userId}`);
            return res.json({ success: true });
          }
          break;

        case 'phone':
          if (type === 'setup') {
            if (!/^\+?[1-9]\d{1,14}$/.test(value))
              return res.status(400).json({ error: 'إستخدم رقم هاتف حقيقي' });
            const verificationCode = Math.floor(
              100000 + Math.random() * 900000
            ).toString();
            setTempVerification(userId, {
              phone: value,
              code: verificationCode,
            });
            console.log(`SMS Code: ${verificationCode} to ${value}`);
            return res.json({ message: 'تم إرسال رمز التحقق إلى هاتفك' });
          } else if (type === 'verify') {
            const redisClient = await getRedisClient();
            const tempData = await redisClient.get(
              `tempVerification:${userId}`
            );
            if (!tempData || token !== tempData.code)
              return res.status(400).json({ error: 'رمز غير صالح' });
            req.user.recoveryPhone = tempData.phone;
            await req.user.save();
            await redisClient.del(`tempVerification:${userId}`);
            return res.json({ success: true });
          }
          break;
      }
    } catch (error) {
      res.status(500).json({ error: 'حدث خطأ في عملية التحقق' });
    }
  }
);

router.post(
  '/@me/security/backup-codes',
  [body('password').notEmpty(), body('twoFactorCode').optional()],
  async (req, res) => {
    try {
      const user = req.user;
      const { password, twoFactorCode } = req.body;

      const isValid = await argon2.verify(user.password, password);
      if (!isValid) {
        return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      }

      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.status(400).json({ error: 'رمز المصادقة الثنائية مطلوب' });
        }
        const isValidToken = authenticator.verify({
          token: twoFactorCode,
          secret: user.twoFactorSecret,
        });
        if (!isValidToken) {
          return res
            .status(401)
            .json({ error: 'رمز المصادقة الثنائية غير صحيح' });
        }
      }

      const backupCodes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substr(2, 9).toUpperCase()
      );

      const hashedCodes = await Promise.all(
        backupCodes.map((code) => argon2.hash(code))
      );

      user.backupCodes = hashedCodes;
      await user.save();

      res.json({ backupCodes });
    } catch (error) {
      res.status(500).json({ error: 'حدث خطأ في إنشاء الرموز الاحتياطية' });
    }
  }
);

router.post(
  '/@me/security/remove-recovery',
  [
    body('type').isIn(['email', 'phone']),
    body('password').notEmpty(),
    body('twoFactorCode').optional(),
  ],
  async (req, res) => {
    try {
      const user = req.user;
      const { type, password, twoFactorCode } = req.body;

      const isValid = await argon2.verify(user.password, password);
      if (!isValid) {
        return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      }

      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.status(400).json({ error: 'رمز المصادقة الثنائية مطلوب' });
        }
        const isValidToken = authenticator.verify({
          token: twoFactorCode,
          secret: user.twoFactorSecret,
        });
        if (!isValidToken) {
          return res
            .status(401)
            .json({ error: 'رمز المصادقة الثنائية غير صحيح' });
        }
      }

      if (type === 'email') {
        user.recoveryEmail = undefined;
      } else {
        user.recoveryPhone = undefined;
      }

      await user.save();
      res.json({ message: 'تم حذف خيار الإعداد بنجاح' });
    } catch (error) {
      res.status(500).json({ error: 'حدث خطأ في حذف خيار الإعداد' });
    }
  }
);

export default router;
