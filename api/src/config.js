// my-api/src/config.js
// Conversion rates object for multiple currencies
const conversionRates = {
  coinToEgpRate: 1 / 1000, // MAIN
  coinToUsdRate: 1 / (50 * 1000), // BASED ON EGP TO USD
};

const coins = [1, 5, 10, 50, 100].map(
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

const subscriptions = [
  {
    name: 'free',
    coins: 2000,
    features: {
      apps: { slots: 2 },
      products: { slots: 10, maxCoins: 20000 },
      gifts: { slots: 10, maxCoins: 20000, maxUsers: 10 },
      cheque: { slots: 10, maxCoins: 20000 },
      airdrop: { slots: 10, maxCoins: 20000, maxUsers: 10 },
      tasks: { daily: { limit: 200, bonus: 20 } },
      donations: { maxCoins: 20000 },
      wallet: { maxSend: 2000, fee: 1, maxCoins: 200000 },
    },
  },
  {
    name: 'basic',
    coins: 5000,
    features: {
      apps: { slots: 3 },
      products: { slots: 15, maxCoins: 30000 },
      gifts: { slots: 15, maxCoins: 30000, maxUsers: 15 },
      cheque: { slots: 15, maxCoins: 30000 },
      airdrop: { slots: 15, maxCoins: 30000, maxUsers: 15 },
      tasks: { daily: { limit: 300, bonus: 30 } },
      donations: { maxCoins: 30000 },
      wallet: { maxSend: 5000, fee: 0.5, maxCoins: 500000 },
    },
  },
  {
    name: 'professional',
    coins: 15000,
    features: {
      apps: { slots: 5 },
      products: { slots: 25, maxCoins: 50000 },
      gifts: { slots: 25, maxCoins: 50000, maxUsers: 25 },
      cheque: { slots: 25, maxCoins: 50000 },
      airdrop: { slots: 25, maxCoins: 50000, maxUsers: 25 },
      tasks: { daily: { limit: 400, bonus: 40 } },
      donations: { maxCoins: 50000 },
      wallet: { maxSend: 100000, fee: 0, maxCoins: 1000000 },
    },
  },
  {
    name: 'elite',
    coins: 50000,
    features: {
      apps: { slots: 10 },
      products: { slots: 50, maxCoins: 100000 },
      gifts: { slots: 50, maxCoins: 100000, maxUsers: 50 },
      cheque: { slots: 50, maxCoins: 100000 },
      airdrop: { slots: 50, maxCoins: 100000, maxUsers: 50 },
      tasks: { daily: { limit: 600, bonus: 60 } },
      donations: { maxCoins: 100000 },
      wallet: { maxSend: 500000, fee: 0, maxCoins: 5000000 },
    },
  },
];

import discordApp from './apps/discord.js';
import youtubeApp from './apps/youtube.js';

export default {
  defaultFee: 2,
  maxSendingAmount: 100000,
  defaultBalance: 5,
  rates: convertedCoins,
  port: 6969,
  host: '192.168.100.45',
  emailUser: 'zampx.98@gmail.com',
  dailyConfig: { limit: 100, bouns: 10 },
  subscriptions,
  apps: [
    discordApp,
    // youtubeApp
  ],
};
