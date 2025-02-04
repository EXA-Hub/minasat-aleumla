// my-api/src/routes/public/wallet.js
import { Router } from 'express';
const router = Router();

import config from '../../config.js';
const { exchange } = config;

// Use a regex to capture the user parameter correctly
router.get('/walletRates', async (req, res) => {
  try {
    res.send({
      exchange,
      currencies: Object.fromEntries(exchange.currencies.entries()),
      data: await (
        await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${Array.from(
            exchange.currencies.keys()
          ).join(',')}&vs_currencies=usd`
        )
      ).json(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطآ في الخادم' });
  }
});

export default router;
