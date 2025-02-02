// api/src/routes/public/market.js
import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../../utils/middleware/validateRequest.js';
import { Product } from '../../utils/schemas/traderSchema.js';
import config from '../../config.js';

const router = express.Router();
const maxPriceAvailable = Object.values(config.subscriptions).pop().features
  .products.maxCoins;

// بحث المنتجات
router.post(
  '/market/products/search',
  [
    body('searchTerm')
      .optional()
      .isString()
      .withMessage('يجب أن يكون مصطلح البحث نصًا')
      .trim(),
    body('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('يجب أن يكون السعر الأدنى رقمًا موجبًا')
      .toFloat(),
    body('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('يجب أن يكون السعر الأقصى رقمًا موجبًا')
      .toFloat(),
    body('minCreatedAt')
      .optional()
      .isISO8601()
      .withMessage('يجب أن يكون تاريخ الإنشاء الأدنى تاريخًا صالحًا')
      .toDate(),
    body('maxCreatedAt')
      .optional()
      .isISO8601()
      .withMessage('يجب أن يكون تاريخ الإنشاء الأقصى تاريخًا صالحًا')
      .toDate(),
    body('minUpdatedAt')
      .optional()
      .isISO8601()
      .withMessage('يجب أن يكون تاريخ التحديث الأدنى تاريخًا صالحًا')
      .toDate(),
    body('maxUpdatedAt')
      .optional()
      .isISO8601()
      .withMessage('يجب أن يكون تاريخ التحديث الأقصى تاريخًا صالحًا')
      .toDate(),
    body('sortBy')
      .optional()
      .isIn(['price', 'createdAt', 'updatedAt', 'openTrades', 'rating']) // Added 'rating'
      .withMessage('مجال الفرز غير صالح'),
    body('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('يجب أن يكون ترتيب الفرز تصاعديًا أو تنازليًا'),
    body('limit')
      .optional()
      .isInt({ min: 1, max: 25 })
      .withMessage('يجب أن يكون الحد بين 1 و25')
      .toInt(),
    body('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('يجب أن يكون الإزاحة رقمًا غير سالب')
      .toInt(),
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 5 })
      .withMessage('يجب أن يكون التقييم بين 0 و5')
      .toFloat(),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const {
        searchTerm,
        minPrice,
        maxPrice,
        minCreatedAt,
        maxCreatedAt,
        minUpdatedAt,
        maxUpdatedAt,
        sortBy = 'updatedAt',
        sortOrder = 'desc',
        limit = 10,
        offset = 0,
        rating,
      } = req.body;

      // Build the base query
      const query = {
        isLocked: false,
        ...(searchTerm && { name: { $regex: searchTerm, $options: 'i' } }),
        ...(minPrice || maxPrice
          ? {
              price: {
                ...(minPrice && { $gte: minPrice }),
                ...(maxPrice && { $lte: maxPrice }),
              },
            }
          : {}),
        ...(minCreatedAt || maxCreatedAt
          ? {
              createdAt: {
                ...(minCreatedAt && { $gte: minCreatedAt }),
                ...(maxCreatedAt && { $lte: maxCreatedAt }),
              },
            }
          : {}),
        ...(minUpdatedAt || maxUpdatedAt
          ? {
              updatedAt: {
                ...(minUpdatedAt && { $gte: minUpdatedAt }),
                ...(maxUpdatedAt && { $lte: maxUpdatedAt }),
              },
            }
          : {}),
      };

      // Add average rating calculation and filtering
      const aggregationPipeline = [
        { $match: query },
        {
          $addFields: {
            avgRating: { $avg: '$commentsAndRatings.rating' },
          },
        },
        ...(rating
          ? [
              {
                $match: { avgRating: { $gte: rating } },
              },
            ]
          : []),
        {
          $sort: {
            [sortBy === 'rating' ? 'avgRating' : sortBy]:
              sortOrder === 'asc' ? 1 : -1,
          },
        },
        { $skip: offset },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
            pipeline: [
              {
                $project: {
                  username: 1,
                  'profile.profilePicture': 1,
                  'privacy.showProfile': 1,
                },
              },
            ],
          },
        },
        { $unwind: '$userId' },
        {
          $addFields: {
            'userId.profilePicture': {
              $cond: [
                '$userId.privacy.showProfile',
                '$userId.profile.profilePicture',
                null,
              ],
            },
          },
        },
        {
          $project: {
            __v: 0,
            commentsAndRatings: 0,
            description: 0,
            'userId.privacy': 0,
            'userId.profile': 0,
          },
        },
      ];

      const products = await Product.aggregate(aggregationPipeline);

      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'خطأ في الخادم أثناء البحث عن المنتجات' });
    }
  }
);

// استكشاف المنتجات
router.post(
  '/market/products/explore',
  [
    body('limit')
      .optional()
      .isInt({ min: 1, max: 25 })
      .withMessage('يجب أن يكون الحد بين 1 و25')
      .toInt(),
    body('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('يجب أن يكون الإزاحة رقمًا غير سالب')
      .toInt(),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { limit = 10, offset = 0 } = req.body;
      res.json({
        products: await Product.aggregate([
          { $match: { isLocked: false } }, // Match unlocked products
          {
            $addFields: {
              avgRating: { $avg: '$commentsAndRatings.rating' }, // Calculate average rating
            },
          },
          {
            $lookup: {
              from: 'users', // Join with the users collection
              localField: 'userId',
              foreignField: '_id',
              as: 'userId',
              pipeline: [
                {
                  $project: {
                    username: 1,
                    'profile.profilePicture': 1,
                    'privacy.showProfile': 1,
                  },
                },
              ],
            },
          },
          { $unwind: '$userId' }, // Unwind the joined user array
          {
            $addFields: {
              'userId.profilePicture': {
                $cond: [
                  '$userId.privacy.showProfile',
                  '$userId.profile.profilePicture',
                  null,
                ],
              },
            },
          },
          {
            $project: {
              __v: 0,
              commentsAndRatings: 0, // Exclude commentsAndRatings from the response
              description: 0, // Exclude description if not needed
              'userId.privacy': 0, // Exclude privacy field
              'userId.profile': 0, // Exclude profile field
            },
          },
          { $sort: { openTrades: -1, updatedAt: -1 } }, // Sort by openTrades and updatedAt
          { $skip: offset }, // Apply pagination
          { $limit: limit },
        ]),
        maxPriceAvailable,
      });
    } catch (error) {
      res.status(500).json({ error: 'خطأ في الخادم أثناء استكشاف المنتجات' });
    }
  }
);

// الحصول على المنتج
router.get(
  '/market/product/:id',
  [
    param('id').isMongoId().withMessage('الرجاء إدخال معرف صالح'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
        .select('-__v')
        // Populate product owner details
        .populate({
          path: 'userId',
          select: 'username profile.profilePicture privacy.showProfile',
          transform: (doc) => {
            if (!doc) return null; // Handle deleted users
            if (!doc.privacy?.showProfile) {
              return {
                _id: doc._id,
                username: doc.username,
                profilePicture: null,
              };
            }
            return {
              _id: doc._id,
              username: doc.username,
              profilePicture: doc.profile?.profilePicture || null,
            };
          },
        })
        .populate({
          path: 'commentsAndRatings.userId',
          select: 'username profile.profilePicture privacy.showProfile',
          transform: (doc) => {
            if (!doc.privacy?.showProfile) return { username: doc.username };
            return {
              username: doc.username,
              profilePicture: doc.profile?.profilePicture,
            };
          },
        })
        .lean();
      if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
  }
);

export default router;
