// my-api/src/config.js
// Conversion rates object for multiple currencies
const conversionRates = {
  coinToEgpRate: 1 / 1000, // MAIN
  coinToUsdRate: 1 / (50 * 1000), // BASED ON EGP TO USD
};

const coins = [1, 5, 10, 25, 50, 100].map(
  (a) => a * Math.ceil(1 / conversionRates.coinToUsdRate)
); // Coins array

// Function to convert coins to various currencies
const convertCoins = (coins) => {
  return coins.map((coinAmount) => {
    const convertedRates = {};

    // Dynamically calculate conversion for each currency in the conversionRates object
    for (const [currency, rate] of Object.entries(conversionRates)) {
      const currencyName = currency.replace('coinTo', '').replace('Rate', ''); // Get currency name (e.g. 'usd')
      convertedRates[currencyName] = parseFloat((coinAmount * rate).toFixed(2));
    }

    return {
      coins: coinAmount,
      ...convertedRates,
    };
  });
};

// Generate the array of objects with the conversions
const convertedCoins = convertCoins(coins);

const plans = {
  free: {
    coins: 0,
    features: {
      wallet: { maxSend: 2000, fee: 2, maxCoins: 200000 },
      tasks: { daily: { limit: 200, bonus: 20 } },
      products: { slots: 10, maxCoins: 20000 },
      gifts: { slots: 10, maxCoins: 20000, maxUsers: 10 },
      airdrop: { slots: 10, maxCoins: 20000, maxUsers: 10 },
      apps: { slots: 2 },
      cheque: { slots: 10, maxCoins: 20000 },
    },
  },
  basic: {
    coins: 5000,
    features: {
      wallet: { maxSend: 5000, fee: 1, maxCoins: 500000 },
      tasks: { daily: { limit: 300, bonus: 30 } },
      products: { slots: 15, maxCoins: 30000 },
      gifts: { slots: 15, maxCoins: 30000, maxUsers: 15 },
      airdrop: { slots: 15, maxCoins: 30000, maxUsers: 15 },
      apps: { slots: 3 },
      cheque: { slots: 15, maxCoins: 30000 },
    },
  },
  professional: {
    coins: 15000,
    features: {
      wallet: { maxSend: 100000, fee: 0.5, maxCoins: 1000000 },
      tasks: { daily: { limit: 400, bonus: 40 } },
      products: { slots: 25, maxCoins: 50000 },
      gifts: { slots: 25, maxCoins: 50000, maxUsers: 25 },
      airdrop: { slots: 25, maxCoins: 50000, maxUsers: 25 },
      apps: { slots: 5 },
      cheque: { slots: 25, maxCoins: 50000 },
    },
  },
  elite: {
    coins: 50000,
    features: {
      wallet: { maxSend: 500000, fee: 0, maxCoins: 5000000 },
      tasks: { daily: { limit: 600, bonus: 60 } },
      products: { slots: 50, maxCoins: 100000 },
      gifts: { slots: 50, maxCoins: 100000, maxUsers: 50 },
      airdrop: { slots: 50, maxCoins: 100000, maxUsers: 50 },
      apps: { slots: 10 },
      cheque: { slots: 50, maxCoins: 100000 },
    },
  },
};

import discordApp from './apps/discord.js';
import youtubeApp from './apps/youtube.js';

export default {
  port: 6969,
  defaultBalance: 5,
  host: '192.168.100.45',
  emailUser: 'zampx.98@gmail.com',
  corn: {
    checkExpiredSubscriptions: {
      cornTime: 24 * 60 * 60 * 1000,
      jobName: 'checkExpiredSubscriptions',
    },
  },
  rates: convertedCoins,
  subscriptions: plans,
  apps: [
    discordApp,
    // youtubeApp
  ],
};
