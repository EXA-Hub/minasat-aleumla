import mongoose from 'mongoose';

const engagementSchema = new mongoose.Schema({
  viewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  }, // The user is viewing
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user whose profile/product is being viewed
  viewedAt: { type: Date, default: Date.now, index: { expires: '30d' } }, // Automatically delete records after 30 days
});

const Engagement = mongoose.model('Engagement', engagementSchema);

export default Engagement;
