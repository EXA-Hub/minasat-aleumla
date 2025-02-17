// api/src/utils/schemas/mongoUserSchema.js
import mongoose from 'mongoose';
import config from '../../config.js';

const { defaultBalance, apps, subscriptions, badges } = config;
const validBadgeNames = badges.slice(2).map((badge) => badge.name);

const privacySchema = new mongoose.Schema({
  showProfile: {
    type: Boolean,
    default: true,
  },
  showWallet: {
    type: Boolean,
    default: true,
  },
});

const profileSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 3,
    maxlength: 40,
  },
  sex: {
    type: String,
    enum: ['ذكر', 'أنثى'], // Only accept 'ذكر' (male) or 'أنثى' (female)
  },
  description: {
    type: String,
    maxlength: 255, // Limit to 255 characters
  },
  profilePicture: {
    type: String,
    match: /^https?:\/\/.+/, // Validate URL format
  },
  wallpaper: {
    type: String,
    match: /^https?:\/\/.+/, // Validate URL format
  },
  title: {
    type: String,
    minlength: 0,
    maxlength: 100, // Limit to 100 characters
  },
  age: {
    type: Number,
    min: [13, 'العمر يجب ان يكون على الاقل 13'], // Minimum age 13
    max: [120, 'العمر يجب ان يكون على الاكثر 120'], // Maximum age 120
  },
});

const donationPageSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'صفحة التبرعات',
  },
  minAmount: {
    type: Number,
    default: 5,
  },
  customAmounts: {
    type: [Number],
    default: [5, 10, 20, 50, 100],
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    match: [/^[A-Za-z0-9]+$/, 'إسم المستخدم يجب ان يحتوى على حروف وارقام'], // Regex for username: A-Z, a-z, 0-9
  },
  password: {
    type: String,
    required: true,
  },
  token: { type: String },
  balance: {
    type: Number,
    default: defaultBalance,
    validate: {
      validator: (value) => value >= 0,
      message: 'الرصيد يجب ان يكون على الاقل 0',
    },
  },
  transactionStats: {
    totalTransactions: {
      type: Number,
      default: 0,
    },
    totalReceived: {
      type: Number,
      default: defaultBalance,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
  // Two-factor authentication related fields
  twoFactorSecret: { type: String, default: null }, // Permanent secret after verification
  twoFactorEnabled: { type: Boolean, default: false }, // Whether 2FA is enabled or not
  recoveryPhone: {
    type: String,
    match: [
      /^\+?[0-9]{7,15}$/, // Matches E.164 and local formats (7 to 15 digits with optional leading +)
      'رقم الجوال غير صالح',
    ],
    // Optional field
    default: null, // Default value
  },
  recoveryEmail: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'بريد إلكتروني غير صالح'], // Simple email regex
    // Optional field
    default: null, // Default value
  },
  backupCodes: [
    {
      type: String,
    },
  ],
  referralId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  tax: {
    type: Number,
    default: 0,
  },
  donationPage: {
    type: donationPageSchema,
    default: () => ({}),
    _id: false,
  },
  profile: {
    type: profileSchema,
    default: () => ({}),
    _id: false,
  },
  privacy: {
    type: privacySchema,
    default: () => ({}),
    _id: false,
  },
  apps: {
    type: apps.reduce((acc, app) => {
      acc[app.id] = [app.schema]; // Define an array of schemas for each app
      return acc;
    }, {}),
    default: {},
    _id: false,
  },
  badges: {
    type: [String],
    default: [],
    enum: validBadgeNames, // Only valid badge names
    validate: {
      validator: function (value) {
        return value.every((badge) => validBadgeNames.includes(badge));
      },
      message: 'اسم الشارة غير صالح', // Error message for invalid badge names
    },
  },
  tier: {
    type: String,
    enum: Object.keys(subscriptions),
    default: Object.keys(subscriptions)[0],
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  // Add other fields as needed
});

const User = mongoose.model('User', userSchema);

export default User;
