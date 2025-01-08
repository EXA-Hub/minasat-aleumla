// my-api/src/utils/schemas/traderSchema.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Middleware to lock/unlock products based on trade status
tradeSchema.post('save', async function (doc) {
  const product = await Product.findById(doc.productId);
  if (doc.isNew && doc.status === 'pending') {
    product.openTrades += 1;
    product.isLocked = true;
  } else if (doc.status === 'accepted' || doc.status === 'rejected') {
    product.openTrades = Math.max(product.openTrades - 1, 0);
    product.isLocked = product.openTrades > 0;
  }
  await product.save();
});

const Trade = mongoose.model('Trade', tradeSchema);

export { Trade, Product };
