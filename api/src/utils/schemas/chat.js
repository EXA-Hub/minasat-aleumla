import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  trade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
    required: true,
  },
  messages: {
    type: [String],
    trim: true,
    maxlength: 100,
    default: [],
  },
});

const Chat = mongoose.model('Chat', chatSchema);

export { Chat };
