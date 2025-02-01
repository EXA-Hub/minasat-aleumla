// api/src/utils/schemas/traderSchema.js
import mongoose, { version } from 'mongoose';

// Define the subdocument schema for comments and ratings
const commentAndRatingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 100, // Note: Corrected to 'maxlength' (lowercase 'l')
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Add custom validator at the schema level
    validate: {
      validator: function () {
        // 'this' refers to the subdocument
        return (
          (this.comment && this.comment.trim()) || this.rating !== undefined
        );
      },
      message: 'يجب إضافة تعليق او تقييم',
    },
  }
);

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
    commentsAndRatings: [commentAndRatingSchema],
  },
  { timestamps: true }
);

// Indexes for Product
productSchema.index({
  price: 1,
  createdAt: 1,
  updatedAt: 1,
});

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
