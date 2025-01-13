import cron from 'node-cron';
import moment from 'moment-timezone'; // For timezone handling
import config from '../../config.js';
import CronJob from '../../utils/schemas/CronJob.js'; // Import the CronJob model
import User from '../../utils/schemas/mongoUserSchema.js'; // Import your user model

const { jobName, cronTime, days } = config.corn.checkExpiredSubscriptions;

// Function to check for expired subscriptions
const checkExpiredSubscriptions = async (sendNotification) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - cronTime * days);

    // Find users whose subscription has expired
    const expiredUsers = await User.find({
      tier: { $ne: 'free' }, // Only check users who are not on the free plan
      subscribedAt: { $lte: thirtyDaysAgo }, // Subscribed 30 or more days ago
    });

    // Perform actions for expired users
    for (const user of expiredUsers) {
      // Downgrade the user to the free plan
      user.tier = 'free';
      user.subscribedAt = Date.now(); // Reset the subscription date
      await user.save();

      // Optionally, send a notification to the user
      console.log(
        `User ${user.username} has been downgraded to the free plan.`
      );
    }

    console.log(
      `Checked for expired subscriptions. ${expiredUsers.length} users downgraded.`
    );

    // Save the last run time to the database
    await CronJob.findOneAndUpdate(
      { jobName },
      { lastRun: new Date() },
      { upsert: true } // Create the document if it doesn't exist
    );

    expiredUsers.forEach(async (user) => {
      await sendNotification(
        '⚠️ إنتهت صلاحية خطتك ⏰',
        Date.now(),
        user.username
      );
    });
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
  }
};

// Function to check if 24 hours have passed since the last run
const shouldRunTask = async () => {
  try {
    const cronJob = await CronJob.findOne({
      jobName,
    });

    if (!cronJob || !cronJob.lastRun) {
      // If no lastRun time exists, run the task immediately
      return true;
    }

    const now = moment().tz('Asia/Riyadh');
    const lastRun = new Date(cronJob.lastRun);

    // Check if 24 hours have passed since the last run
    return now - lastRun >= cronTime;
  } catch (error) {
    console.error('Error checking last run time:', error);
    return false; // Default to not running the task if there's an error
  }
};

// Function to start the task
const startTask = async (sendNotification) => {
  const shouldRun = await shouldRunTask();

  if (shouldRun) {
    console.log('Running task immediately...');
    await checkExpiredSubscriptions(sendNotification);
  } else {
    console.log('Task not run. 24 hours have not passed since the last run.');
  }

  // Schedule the task to run daily at 12:00 PM Mecca time
  cron.schedule(
    '0 12 * * *', // Run at 12:00 PM
    async () => {
      console.log('Running task at 12:00 PM Mecca time...');
      await checkExpiredSubscriptions(sendNotification);
    },
    {
      timezone: 'Asia/Riyadh', // Use 'Asia/Riyadh' for Mecca time
    }
  );
};

// Start the task
export default startTask;
