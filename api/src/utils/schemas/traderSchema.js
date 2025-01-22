// api/src/utils/schemas/traderSchema.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 255,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 10000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    openTrades: {
      type: Number,
      default: 0,
      min: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

const tradeSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    stage: {
      type: String,
      enum: ['buyer_offered', 'seller_accepted', 'buyer_confirmed'],
      default: 'buyer_offered',
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Set confirmedAt when stage is updated to 'buyer_confirmed'
tradeSchema.pre('save', function (next) {
  if (this.isModified('stage') && this.stage === 'buyer_confirmed') {
    this.confirmedAt = new Date();
  }
  next();
});

// Create TTL index on confirmedAt (30 days)
tradeSchema.index(
  { confirmedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

const Trade = mongoose.model('Trade', tradeSchema);

export { Trade, Product };
