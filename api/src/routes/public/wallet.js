// my-api/src/routes/public/wallet.js
import { Router } from 'express';
const router = Router();

import config from '../../config.js';
const { rates } = config;

// Use a regex to capture the user parameter correctly
router.get('/walletRates', (req, res) => {
  res.send(rates);
});

export default router;
