// my-api/src/apps/discord.js
import mongoose from 'mongoose';
import { env } from '../utils/env.js';
env();
const AppID = 'Discord';
const discordApp = {
  id: AppID,
  name: 'ديسكورد',
  svg: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/discord.svg',
  redirectUrl: `https://discord.com/oauth2/authorize?client_id=${
    process.env.DISCORD_CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI
  )}&scope=identify`,
  bgColor: '#7289DA',
  connect: async (data, user, User) => {
    const code = data.query.code;
    const url = 'https://discord.com/api/oauth2/token';

    const body = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: data.redirectUrl,
    });

    try {
      // Get token
      const tokenResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        throw new Error('Failed to get access token');
      }

      // Get user data
      const userResponse = await fetch(
        'https://discord.com/api/v10/users/@me',
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );
      const userData = await userResponse.json();

      // Check if userData.id exists in other users' apps
      if (await User.exists({ [`apps.${AppID}.id`]: userData.id }))
        throw new Error('i have a boyfriend');

      // Save to database
      user.apps[AppID] = [
        ...user.apps[AppID].filter((u) => u.id !== userData.id),
        {
          id: userData.id,
          name: userData.username,
          avatar: userData.avatar,
          banner: userData.banner,
          token_type: tokenData.token_type,
          access_token: tokenData.access_token,
          expires_in: tokenData.expires_in,
          refresh_token: tokenData.refresh_token,
          scope: tokenData.scope,
        },
      ];

      await user.save();
    } catch (error) {
      console.error('Discord connection error:', error);
      throw error;
    }
  },
  schema: new mongoose.Schema({
    _id: false,
    id: { type: String, required: true }, // default required
    name: { type: String, required: true }, // default required
    avatar: { type: String, required: true },
    banner: { type: String, default: null },
    token_type: { type: String, required: true },
    access_token: { type: String, required: true },
    expires_in: { type: Number, required: true },
    refresh_token: { type: String, required: true },
    scope: { type: String, required: true },
  }),
  router: null,
  images: (user) => ({
    profilePictures: user.apps[AppID].map(({ id, avatar }) => ({
      [id]: avatar,
    })),
    wallpapers: user.apps[AppID].map(({ id, banner }) => ({ [id]: banner })),
  }),
  image: (user, accountId, imageType) => {
    const account = user.apps[AppID].find((acc) => acc.id === accountId);
    if (!account) return;
    const { id, avatar, banner } = account;
    const image = imageType === 'profilePicture' ? avatar : banner;
    const extension = image.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/${
      imageType === 'profilePicture' ? 'avatars' : 'banners'
    }/${id}/${image}.${extension}`;
  },
};
export default discordApp;
