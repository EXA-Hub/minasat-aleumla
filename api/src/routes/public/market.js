// api/src/routes/public/market.js
import express from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../../utils/middleware/validateRequest.js';
import { Product } from '../../utils/schemas/traderSchema.js';
import User from '../../utils/schemas/mongoUserSchema.js';

const router = express.Router();

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
      .isIn(['price', 'createdAt', 'updatedAt', 'openTrades'])
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
      } = req.body;

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

      const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const products = await Product.find(query)
        .sort(sortOptions)
        .limit(limit)
        .skip(offset)
        .lean();

      res.json(products);
    } catch (error) {
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

      const products = await Product.find({ isLocked: false })
        .sort({ openTrades: -1, updatedAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في الخادم أثناء استكشاف المنتجات' });
    }
  }
);

// الحصول على المستخدمين
router.post(
  '/market/users',
  [
    body('ids')
      .isArray({ min: 1, max: 25 })
      .withMessage(
        'يجب أن تكون معرفات المستخدمين مصفوفة تحتوي على 1-25 عنصرًا'
      ),
    body('ids.*')
      .isMongoId()
      .withMessage('يجب أن يكون كل معرف مستخدم معرفًا صالحًا'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { ids } = req.body;

      const users = await User.find(
        { _id: { $in: ids } },
        '_id username profile.profilePicture'
      )
        .limit(25)
        .lean();

      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في الخادم أثناء جلب المستخدمين' });
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
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'المنتج غير موجود' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'خطأ في الخادم' });
    }
  }
);

export default router;
