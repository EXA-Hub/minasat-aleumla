// my-api/src/routes/public/wallet.js
import { Router } from 'express';
const router = Router();

import config from '../../config.js';
const { conversionRates } = config;

// Use a regex to capture the user parameter correctly
router.get('/walletRates', (req, res) => {
  const coins = [
    1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000,
  ];

  // Function to convert coins to various currencies
  const convertCoins = (coins) => {
    return coins.map((coinAmount) => {
      const convertedRates = {};

      // Dynamically calculate conversion for each currency in the conversionRates object
      for (const [currency, rate] of Object.entries(conversionRates)) {
        const currencyName = currency.replace('coinTo', '').replace('Rate', ''); // Get currency name (e.g. 'usd')
        convertedRates[currencyName] = parseFloat(
          (coinAmount * rate).toFixed(
            currencyName.toLocaleLowerCase() === 'btc' ? 8 : 2
          )
        );
      }

      return {
        coins: coinAmount,
        ...convertedRates,
      };
    });
  };

  res.send(convertCoins(coins));
});

export default router;
