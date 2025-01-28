// my-api/src/routes/auth/afiliate.js
import express from 'express';
import User from '../../utils/schemas/mongoUserSchema.js'; // User model

const router = express.Router();

router.get('/@me/referrals', async (req, res) => {
  try {
    return res.status(200).json({
      referrals: await User.find({ referralId: req.user._id }).select(
        'username _id tax'
      ),
      id: req.user._id,
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'خطآ في الفحص' });
  }
});

// Route to add the sum of taxes from all referrals to the referrer's balance
router.put('/@me/taxes', async (req, res) => {
  try {
    const session = await User.startSession();
    session.startTransaction();

    try {
      // 1. Calculate total taxes (in transaction)
      const referrals = await User.find({ referralId: req.user._id }).session(
        session
      );
      const totalTax = referrals.reduce((sum, user) => sum + user.tax, 0);

      // 2. Update referrer's balance (in transaction)
      req.user.balance += totalTax;
      await req.user.save({ session });

      // 3. Reset referral taxes (in transaction)
      await User.updateMany(
        { referralId: req.user._id },
        { $set: { tax: 0 } },
        { session }
      );

      await session.commitTransaction();

      return res.status(200).json({
        message: 'تم حصد الأرباح بنجاح وتمت إعادة تعيين الضرائب للمحالين.',
      });
    } catch (error) {
      await session.abortTransaction();
      return res
        .status(500)
        .json({ message: 'فشلت عملية الحصد، تم التراجع عن التغييرات' });
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error updating referrer's tax:", error);
    res.status(500).json({ error: 'خطآ في الفحص' });
  }
});

export default router;
