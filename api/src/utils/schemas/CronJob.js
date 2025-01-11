import mongoose from 'mongoose';

const cronJobSchema = new mongoose.Schema({
  jobName: { type: String, required: true, unique: true }, // Name of the cron job
  lastRun: { type: Date, default: null }, // Last run time
});

const CronJob = mongoose.model('CronJob', cronJobSchema);

export default CronJob;
