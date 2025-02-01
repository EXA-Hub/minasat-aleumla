// api/src/routes/auth/engagment.js
import express from 'express';
import getRedisClient from '../../utils/libs/redisClient.js';
import Engagement from '../../utils/schemas/engagements.js';
import User from '../../utils/schemas/mongoUserSchema.js';

const router = express.Router();

router.get('/@me/engagement', async (req, res) => {
  try {
    const userId = req.user._id; // Get the authenticated user's ID
    const redisClient = await getRedisClient();
    // Check if data is already cached
    const cacheKey = `userEngagementData_${userId}`;
    if (cachedData)
      return res.json(JSON.parse(await redisClient.get(cacheKey)));

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch user engagement data for the authenticated user
    const userEngagements = await Engagement.find({
      userId, // Filter by the authenticated user's ID
      viewedAt: { $gte: thirtyDaysAgo }, // Only fetch records from the last 30 days
    }).sort({ viewedAt: -1 });

    // Aggregate views by date
    const viewsData = userEngagements.reduce((acc, engagement) => {
      const date = engagement.viewedAt.toLocaleDateString('ar-EG');
      if (!acc[date]) acc[date] = { date, views: 0 };
      acc[date].views += 1; // Increment view count for the date
      return acc;
    }, {});

    // Format the data for the frontend
    const formattedViewsData = Object.values(viewsData).map((data) => ({
      date: data.date,
      views: data.views,
    }));

    // Assuming userEngagements is an array of engagement objects
    const viewerIds = userEngagements
      .map((data) => data.viewerId) // Extract the viewer IDs
      .filter((viewerId) => viewerId) // Filter out null or undefined viewer IDs
      .map((viewerId) => viewerId.toString()); // Convert ObjectId to string for comparison

    const response = {
      viewsData: formattedViewsData,
      viewerIds: (
        await User.find({ _id: { $in: [...new Set(viewerIds)] } })
          .select('username')
          .lean()
      ).map((user) => user.username),
    };

    // Cache the data
    await redisClient.set(cacheKey, JSON.stringify(response), {
      EX: 86400,
    }); // 24 hours TTL

    // Send the response
    res.json(response);
  } catch (error) {
    console.error('Error fetching user engagement data:', error);
    res.status(500).json({ error: 'خطآ في الخادم' });
  }
});

export default router;
