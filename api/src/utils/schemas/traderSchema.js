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

// Indexes for Product
productSchema.index({ userId: 1 });
productSchema.index({ isLocked: 1 });
productSchema.index({ openTrades: 1 });

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

// Pre-save hook for Trade
tradeSchema.pre('save', function (next) {
  if (this.isModified('stage') && this.stage === 'buyer_confirmed')
    this.confirmedAt = new Date();
  next();
});

// Indexes for Trade
tradeSchema.index(
  { confirmedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);
tradeSchema.index({ productId: 1 });
tradeSchema.index({ buyerId: 1 });
tradeSchema.index({ stage: 1 });

const Trade = mongoose.model('Trade', tradeSchema);

export { Trade, Product };
