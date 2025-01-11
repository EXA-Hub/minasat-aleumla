// api/src/routes/public/plans.js
import { Router } from 'express';
import config from '../../config.js';

const router = Router();

router.get('/plans', async (req, res) => {
  try {
    const { subscriptions } = config;
    res.json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'فشل في جلب الخطط المعروضة' });
  }
});

export default router;
