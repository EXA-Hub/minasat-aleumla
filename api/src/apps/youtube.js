// my-api/src/apps/youtube.js
import mongoose from 'mongoose';
const AppID = 'YouTube';
// import dotenv from "dotenv-safe";
// dotenv.config({
//   allowEmptyValues: true,
// });
const youtubeApp = {
  id: AppID,
  name: 'يوتيوب',
  svg: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/youtube.svg',
  redirectUrl: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.YOUTUBE_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.YOUTUBE_REDIRECT_URI
  )}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&access_type=offline&prompt=consent`,
  bgColor: '#FF0000',
  connect: async (data, user) => {
    const code = data.query.code;
    const tokenUrl = 'https://oauth2.googleapis.com/token';

    const body = new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: data.redirectUrl,
    });

    try {
      // Get token
      const tokenResponse = await fetch(tokenUrl, {
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

      // Get channel data
      const channelResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,brandingSettings&mine=true',
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );
      const channelData = await channelResponse.json();
      const channel = channelData.items[0];

      // Save to database
      user.apps[AppID] = [
        ...user.apps[AppID].filter((c) => c.id !== channel.id),
        {
          id: channel.id,
          name: channel.snippet.title,
          profilePicture: channel.snippet.thumbnails.high.url,
          banner: channel.brandingSettings.image?.bannerExternalUrl,
          token_type: tokenData.token_type,
          access_token: tokenData.access_token,
          expires_in: tokenData.expires_in,
          refresh_token: tokenData.refresh_token,
          scope: tokenData.scope,
        },
      ];

      await user.save();
    } catch (error) {
      console.error('YouTube connection error:', error);
      throw error;
    }
  },
  schema: new mongoose.Schema({
    _id: false,
    id: { type: String, required: true },
    name: { type: String, required: true },
    profilePicture: { type: String, required: true },
    banner: { type: String, default: null },
    token_type: { type: String, required: true },
    access_token: { type: String, required: true },
    expires_in: { type: Number, required: true },
    refresh_token: { type: String, required: true },
    scope: { type: String, required: true },
  }),
  router: null,
  images: (user) => ({
    profilePictures: user.apps[AppID].map(({ id, profilePicture }) => ({
      [id]: profilePicture,
    })),
    wallpapers: user.apps[AppID].map(({ id, banner }) => ({ [id]: banner })),
  }),
  image: (user, accountId, imageType) => {
    const account = user.apps[AppID].find((acc) => acc.id === accountId);
    if (!account) return;
    return imageType === 'profilePicture'
      ? account.profilePicture
      : account.banner;
  },
};

export default youtubeApp;
