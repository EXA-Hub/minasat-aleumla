import crypto from 'crypto';
import mongoose from 'mongoose';
import { env } from '../utils/env.js';
env();

function verifyTelegramHash({ hash, ...userData }, botToken) {
  // Create data check string
  const dataCheckString = Object.keys(userData)
    .sort()
    .map((key) => `${key}=${userData[key]}`)
    .join('\n');

  // Create secret key
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  // Compute HMAC-SHA-256 hash
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // Compare hashes
  return computedHash === hash;
}

const AppID = 'Telegram';
const App = {
  id: AppID,
  name: 'تيليجرام',
  svg: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/telegram.svg',
  redirectUrl: process.env.TELEGRAM_REDIRECT_URI,
  bgColor: '#0088cc',
  connect: async (data, user, User) => {
    console.log(data);
    const { id, first_name, last_name, username, photo_url, auth_date } =
      data.user;
    // verfiy if telegram send hash
    if (!verifyTelegramHash(data.user, process.env.TELEGRAM_BOT_TOKEN))
      throw new Error('invalid hash');
    // Verify if another user has this account
    if (await User.exists({ [`apps.${AppID}.id`]: id }))
      throw new Error('i have a boyfriend');
    // Save to database
    user.apps[AppID] = [
      ...user.apps[AppID].filter((u) => u.id !== id),
      {
        id: id.toString(),
        name: [first_name, last_name].filter(Boolean).join(' ') || username,
        username,
        photo_url,
        auth_date,
      },
    ];
    await user.save();
  },
  schema: new mongoose.Schema({
    _id: false,
    id: { type: String, required: true },
    name: { type: String, required: true },
    username: String,
    photo_url: String,
    auth_date: Number,
  }),
  images: (user) => {
    const accounts = user.apps[AppID] || [];
    return {
      profilePictures: accounts
        .filter((acc) => acc.photo_url)
        .map((acc) => acc.photo_url),
      wallpapers: [],
    };
  },
  image: (user, accountId, imageType) => {
    if (imageType !== 'profilePicture') return;
    const account = user.apps[AppID]?.find((acc) => acc.id === accountId);
    return account?.photo_url;
  },
};

export default App;
