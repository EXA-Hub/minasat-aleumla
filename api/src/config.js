// my-api/src/config.js

// total amount of coins in the wallets
// total amount of usds in the wallets
if (!process.env.coinsAmount || !process.env.usdsAmount)
  throw new Error('Missing environment variables: coinsAmount, usdsAmount');
else if (isNaN(process.env.coinsAmount) || isNaN(process.env.usdsAmount))
  throw new Error('Invalid environment variables: coinsAmount, usdsAmount');

const { coinsAmount, usdsAmount } = process.env;

// Conversion rates object for multiple currencies
const conversionRates = {
  coinToUsdtRate: usdsAmount / coinsAmount, // MAIN usd/coin rate
};
// how much usd i gain for 1000 daily task the users do
const UsdtoDaily = 6 / 1000;
// how much coins i gain for 1 daily task the users do
const CoinstoDaily = UsdtoDaily / conversionRates.coinToUsdtRate;
// the dailyBonus is static amount
const dailyBonus = Math.floor(CoinstoDaily / 10 - CoinstoDaily / 40);
// the dailyQuarter is random range
const dailyQuarter = Math.floor(CoinstoDaily / 4 - dailyBonus);

const plans = {
  free: {
    coins: 0,
    features: {
      wallet: { maxSend: 2000, fee: 2, maxCoins: 200000 },
      tasks: { daily: { limit: dailyQuarter, bonus: dailyBonus } },
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
      tasks: { daily: { limit: dailyQuarter * 2, bonus: dailyBonus * 2 } },
      products: { slots: 15, maxCoins: 30000 },
      gifts: { slots: 15, maxCoins: 30000, maxUsers: 15 },
      airdrop: { slots: 15, maxCoins: 30000, maxUsers: 15 },
      apps: { slots: 3 },
      cheque: { slots: 15, maxCoins: 30000 },
    },
  },
  professional: {
    coins: 25000,
    features: {
      wallet: { maxSend: 100000, fee: 0.5, maxCoins: 1000000 },
      tasks: { daily: { limit: dailyQuarter * 3, bonus: dailyBonus * 3 } },
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
      tasks: { daily: { limit: dailyQuarter * 4, bonus: dailyBonus * 4 } },
      products: { slots: 50, maxCoins: 100000 },
      gifts: { slots: 50, maxCoins: 100000, maxUsers: 50 },
      airdrop: { slots: 50, maxCoins: 100000, maxUsers: 50 },
      apps: { slots: 10 },
      cheque: { slots: 50, maxCoins: 100000 },
    },
  },
};

const badges = [
  {
    name: 'محترف',
    tier: 'professional',
    icon: '/icons/professional-badge.svg', // Professional badge icon
    msg: 'الإشتراك الإحترافي',
    isPremium: false,
  },
  {
    name: 'النخبة',
    tier: 'elite',
    icon: '/icons/elite-badge.svg', // Elite badge icon
    msg: 'إشتراك النخبة المميزة',
    isPremium: true,
  },
  {
    name: 'متبرع',
    icon: '/icons/donation-badge.svg', // Donation badge icon
    msg: 'تبرع بمبلغ لا يقل عن عشرة آلاف',
    isPremium: false,
  },
  {
    name: 'متبرع سخي',
    icon: '/icons/generous-donor-badge.svg', // Generous donor badge icon
    msg: 'تبرع بمبلغ لا يقل عن مئة ألف',
    isPremium: true,
  },
  {
    name: 'مطور',
    icon: '/icons/developer-badge.svg', // Developer badge icon
    msg: 'أحد مطوري المنصة',
    isPremium: false,
  },
  {
    name: 'مشرف',
    icon: '/icons/moderator-badge.svg', // Moderator badge icon
    msg: 'أحد مشرفي المنصة',
    isPremium: false,
  },
  {
    name: 'مدير',
    icon: '/icons/manager-badge.svg', // Manager badge icon
    msg: 'أحد مديري المنصة',
    isPremium: false,
  },
  {
    name: 'أوائل الداعمين',
    icon: '/icons/early-supporter-badge.svg', // Early supporter badge icon
    msg: 'شارة مخصصة للداعمين الأوائل',
    isPremium: true,
  },
];

import { isProduction } from './utils/env.js';
import discordApp from './apps/discord.js';
import telegramApp from './apps/telegram.js';
import youtubeApp from './apps/youtube.js';

export default {
  port: isProduction
    ? Math.floor(Math.random() * (65535 - 1024 + 1) + 1024)
    : 6969,
  defaultBalance: 5,
  isProduction,
  host: '0.0.0.0',
  emailUser: 'zampx.98@gmail.com',
  cron: {
    // Changed from 'corn' to 'cron'
    checkExpiredSubscriptions: {
      jobName: 'checkExpiredSubscriptions',
      days: 30,
    },
  },
  subscriptions: plans,
  conversionRates,
  badges,
  apps: [
    discordApp,
    telegramApp,
    // youtubeApp
  ],
};
