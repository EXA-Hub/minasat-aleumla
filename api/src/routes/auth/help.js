import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

const HelpSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subject: { type: String, required: true, minlength: 3, maxlength: 25 },
  type: {
    type: String,
    required: true,
    enum: ['help', 'report', 'bug'],
    default: 'help',
  },
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, 'بريد إلكتروني غير صالح'],
  },
  message: { type: String, required: true, minlength: 3, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now },
});

const Help = mongoose.model('Help', HelpSchema);

// POST route to send help request
router.post('/@me/help', async (req, res) => {
  try {
    const { body } = req;
    const help = new Help({
      user: req.user._id,
      subject: body.subject,
      type: body.type,
      email: body.email,
      message: body.message,
    });
    await help.save();
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'خطآ في الخادم' });
  }
});

export default router;
