// api/src/functions/jobs/ExpiredSubscriptions.js
import cron from 'node-cron';
import moment from 'moment-timezone';
import config from '../../config.js';
import CronJob from '../../utils/schemas/CronJob.js';
import User from '../../utils/schemas/mongoUserSchema.js';

const { jobName, days } = config.cron.checkExpiredSubscriptions; // Fixed typo in config reference

// Function to check for expired subscriptions
const checkExpiredSubscriptions = async (sendNotification) => {
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

        if (sendNotification) {
          await sendNotification(
            '⚠️ إنتهت صلاحية خطتك ⏰',
            Date.now(),
            user.username
          );
        }

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

// Function to check if it's time to run the task
const shouldRunTask = async () => {
  try {
    const cronJob = await CronJob.findOne({ jobName });

    if (!cronJob?.lastRun) {
      return true;
    }

    const now = moment().tz('Asia/Riyadh');
    const lastRun = moment(cronJob.lastRun).tz('Asia/Riyadh');

    // Check if 24 hours have passed
    return now.diff(lastRun, 'hours') >= 24;
  } catch (error) {
    console.error('Error checking last run time:', error);
    return false;
  }
};

// Function to start the task
const startTask = async (sendNotification) => {
  // Initial check
  const shouldRun = await shouldRunTask();

  if (shouldRun) {
    console.log('Running task immediately...');
    await checkExpiredSubscriptions(sendNotification);
  }

  // Schedule the task to run daily at 12:00 PM Mecca time
  cron.schedule(
    '0 12 * * *',
    async () => {
      console.log('Running scheduled task at 12:00 PM Mecca time...');
      await checkExpiredSubscriptions(sendNotification);
    },
    {
      timezone: 'Asia/Riyadh',
    }
  );
};

export default startTask;
