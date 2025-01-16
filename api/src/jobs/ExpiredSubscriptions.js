// api/src/jobs/ExpiredSubscriptions.js
import moment from 'moment-timezone';
import { connectToMongoDB } from '../utils/libs/mongoose.js';
import User from '../utils/schemas/mongoUserSchema.js';
import CronJob from '../utils/schemas/CronJob.js';
import { ws } from '../utils/webhook.js';
import config from '../config.js';

const { jobName, days } = config.cron.checkExpiredSubscriptions;

// Function to check for expired subscriptions
const checkExpiredSubscriptions = async () => {
  await connectToMongoDB();
  const lockKey = `${jobName}_lock`;
  try {
    // Try to acquire lock
    const lock = await CronJob.findOneAndUpdate(
      {
        jobName: lockKey,
        lastRun: { $lt: moment().subtract(5, 'minutes').toDate() },
      },
      { lastRun: new Date() },
      { upsert: true, new: true }
    );

    if (!lock) {
      console.log('Job is already running');
      return;
    }

    // Calculate expiration date using moment for better date handling
    const expirationDate = moment().subtract(days, 'days').toDate();

    // Find users whose subscription has expired
    const expiredUsers = await User.find({
      tier: { $ne: 'free' },
      subscribedAt: { $lte: expirationDate },
    });

    // Process expired users
    const updatePromises = expiredUsers.map(async (user) => {
      try {
        await User.findByIdAndUpdate(user._id, {
          tier: 'free',
          subscribedAt: new Date(),
        });

        await ws.wss.sendNotification(
          '⚠️ إنتهت صلاحية خطتك ⏰',
          Date.now(),
          user.username
        );

        console.log(
          `User ${user.username} has been downgraded to the free plan.`
        );
      } catch (error) {
        console.error(`Error processing user ${user.username}:`, error);
      }
    });

    await Promise.all(updatePromises);

    console.log(
      `Checked for expired subscriptions. ${expiredUsers.length} users downgraded.`
    );

    // Update the main job's last run time
    await CronJob.findOneAndUpdate(
      { jobName },
      { lastRun: new Date() },
      { upsert: true }
    );

    // Release lock
    await CronJob.findOneAndUpdate(
      { jobName: lockKey },
      { lastRun: moment().subtract(10, 'minutes').toDate() }
    );
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    // Attempt to release lock in case of error
    try {
      await CronJob.findOneAndUpdate(
        { jobName: lockKey },
        { lastRun: moment().subtract(10, 'minutes').toDate() }
      );
    } catch (lockError) {
      console.error('Error releasing lock:', lockError);
    }
  }
};

// Export the function as a serverless endpoint
export default async function handler(req, res) {
  // Authorization check (optional but recommended)
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
    return res.status(401).json({ message: 'Unauthorized' });

  try {
    await checkExpiredSubscriptions(); // Call your cron job logic
    res.status(200).json({ message: 'Cron job executed successfully' });
  } catch (error) {
    console.error('Error in cron job:', error);
    res.status(500).json({ message: 'Cron job failed', error: error.message });
  }
}
