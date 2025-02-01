// api/src/routes/auth/commentsAndRating.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../../utils/middleware/validateRequest.js';
import { Product, Trade } from '../../utils/schemas/traderSchema.js';

const router = Router();

const commentValidator = [
  param('productId').isMongoId().withMessage('معرف المنتج غير صالح'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('التعليق يجب ان لا يتجاوز 100 حرف'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('التقييم يجب ان يكون بين 0 و 5'),
];

// Add comment/rating to product
router.post(
  '/products/:productId/comments',
  [
    ...commentValidator,
    body('tradeId').isMongoId().withMessage('معرف الصفقة غير صالح'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { productId } = req.params;
      const { comment, rating, tradeId } = req.body;

      const checkTrade = await Trade.exists({
        _id: tradeId,
        stage: 'buyer_confirmed',
        buyerId: req.user._id,
        productId: productId,
      });

      if (!checkTrade)
        return res.status(400).json({ error: 'الصفقة غير صالحة' });

      // Check if user already commented
      const existingComment = await Product.exists({
        _id: productId,
        'commentsAndRatings.userId': req.user._id,
      });

      if (existingComment)
        return res
          .status(400)
          .json({ error: 'لديك تعليق مسبق على هذا المنتج' });

      await Product.findByIdAndUpdate(productId, {
        $push: {
          commentsAndRatings: {
            userId: req.user._id,
            comment: comment?.trim(),
            rating,
            date: Date.now(),
          },
        },
      });

      res.sendStatus(201);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في إضافة التعليق' });
    }
  }
);

// Update user's comment/rating
router.put(
  '/products/:productId/comments/:commentId',
  [
    param('commentId').isMongoId().withMessage('معرف التعليق غير صالح'),
    ...commentValidator,
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { productId, commentId } = req.params;
      let updateData = {};

      if (req.body.comment === undefined && req.body.rating === undefined)
        return res.status(400).json({ error: 'يجب تحديث التعليق او التقييم' });

      updateData['commentsAndRatings.$.comment'] = (
        req.body.comment || ''
      ).trim();
      updateData['commentsAndRatings.$.rating'] = req.body.rating;

      const result = await Product.updateOne(
        {
          _id: productId,
          'commentsAndRatings._id': commentId,
          'commentsAndRatings.userId': req.user._id,
        },
        { $set: updateData }
      );

      if (result.modifiedCount === 0)
        return res.status(404).json({ error: 'التعليق غير موجود' });

      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في تحديث التعليق' });
    }
  }
);

// Delete comment/rating
router.delete(
  '/products/:productId/comments/:commentId',
  [
    param('productId').isMongoId().withMessage('معرف المنتج غير صالح'),
    param('commentId').isMongoId().withMessage('معرف التعليق غير صالح'),
    validateRequest,
  ],
  async (req, res) => {
    try {
      const { productId, commentId } = req.params;

      const result = await Product.updateOne(
        {
          _id: productId,
          'commentsAndRatings._id': commentId,
          'commentsAndRatings.userId': req.user._id,
        },
        { $pull: { commentsAndRatings: { _id: commentId } } }
      );

      if (result.modifiedCount === 0)
        return res.status(404).json({ error: 'التعليق غير موجود' });

      res.sendStatus(204);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'فشل في حذف التعليق' });
    }
  }
);

export default router;
