// my-api/src/routes/public/connect.js
import { Router } from 'express';
import config from '../../config.js';

const router = Router();
const { apps } = config;

router.get('/app/connect/:appId', (req, res) => {
  const { appId } = req.params;

  // Validate if the appId exists in the apps array
  const app = apps.find(
    (app) => app.id.toLocaleLowerCase() === appId.toLocaleLowerCase()
  );

  if (!app) return res.status(400).json({ error: 'التطبيق غير موجود', appId }); // 'App not found' in Arabic

  // Redirect to the app's redirectUrl
  res.redirect(app.redirectUrl);
});

export default router;
