import { Router } from 'express';
import config from '../../config.js';

const router = Router();
const { apps, subscriptions } = config;

apps.forEach((app) => {
  if (app.router) app.router(router);
});

router.get('/@me/apps', async (req, res) => {
  try {
    const { slots } = subscriptions[req.user.tier].features.apps;
    res.json(
      apps.map(({ id, name, svg, bgColor }) => ({
        id,
        name,
        svg,
        bgColor,
        slots,
        connectedAccounts: req.user.apps[id].map(({ id, name }) => ({
          id,
          name,
        })),
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطآ في الخادم' });
  }
});

// POST route to verify connection
router.post('/@me/apps/verifyConnection', async (req, res) => {
  try {
    const { body } = req;
    // Validate if the app in the body exists in the apps array
    const app = apps.find(
      (app) => app.id.toLocaleLowerCase() === body.app.toLocaleLowerCase()
    );
    if (!app) return res.status(400).json({ error: 'التطبيق غير موجود' }); // 'App not found' in Arabic
    const { slots } = subscriptions[req.user.tier].features.apps;
    if (req.user.apps[app.id].length >= slots)
      return res.status(400).json({ error: 'تم تجاوز حد التطبيقات' });
    else await app.connect(body, req.user);
    // Respond with a success status
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'خطآ في الخادم' }); // 'Server error' in Arabic
  }
});

// POST route to disconnect
router.put('/@me/apps/disconnect', async (req, res) => {
  try {
    const { body } = req;

    // Validate if the app in the body exists in the apps array
    const appExists = apps.some((app) => app.id === body.appId);

    if (!appExists) return res.status(400).json({ error: 'التطبيق غير موجود' }); // 'App not found' in Arabic

    req.user.apps[body.appId] = req.user.apps[body.appId].filter(
      (account) => account.id !== body.account.id
    );
    req.user.save();

    // Respond with a success status
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'خطآ في الخادم' }); // 'Server error' in Arabic
  }
});

import { body, validationResult } from 'express-validator';

router.post(
  '/@me/images',
  [
    body('action').isIn(['get', 'set']).withMessage('الإجراء غير صالح'),
    body('appId').optional().isString().withMessage('معرف التطبيق غير صالح'),
    body('accountId').optional().isString().withMessage('معرف الحساب غير صالح'),
    body('imageType')
      .optional()
      .isIn(['profilePicture', 'wallpaper'])
      .withMessage('نوع الصورة غير صالح'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array().map((err) => ({ ...err, msg: err.msg })),
      });
    }

    try {
      const { action, appId, accountId, imageType } = req.body;

      switch (action) {
        case 'get': {
          const images = apps.map(({ id, svg, bgColor, images, name }) => ({
            id,
            svg,
            name,
            bgColor,
            images: images(req.user),
          }));
          return res.json(images);
        }

        case 'set': {
          if (!appId || !accountId || !imageType) {
            return res
              .status(400)
              .json({ error: 'الحقول المطلوبة مفقودة لإجراء التعيين' });
          }

          const app = apps.find((app) => app.id === appId);
          if (!app) {
            return res.status(400).json({ error: 'التطبيق غير موجود' });
          }

          const imageUrl = app.image(req.user, accountId, imageType);

          switch (imageType) {
            case 'profilePicture':
              req.user.profile.profilePicture = imageUrl;
              break;
            case 'wallpaper':
              req.user.profile.wallpaper = imageUrl;
              break;
          }

          await req.user.save();
          return res.sendStatus(200);
        }

        default:
          return res.status(400).json({ error: 'الإجراء غير صالح' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'خطأ في الخادم' });
    }
  }
);

export default router;
