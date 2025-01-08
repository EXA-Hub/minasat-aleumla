// my-api/src/routes/auth/afiliate.js
import express from 'express';
import User from '../../utils/schemas/mongoUserSchema.js'; // User model

const router = express.Router();

router.get('/@me/referrals', async (req, res) => {
  try {
    // Find all referrals for the given userId
    const referrals = await User.find({ referralId: req.user._id }).select(
      'username _id tax'
    );
    return res.status(200).json({ referrals, id: req.user._id });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'خطآ في الفحص' });
  }
});

// Route to add the sum of taxes from all referrals to the referrer's balance
router.put('/@me/taxes', async (req, res) => {
  try {
    // Find all referrals for the given userId (referrer)
    const referrals = await User.find({ referralId: req.user._id });

    // Calculate the sum of the tax values of all referrals
    const totalTax = referrals.reduce((sum, user) => sum + user.tax, 0);

    // Set the tax of all referred users to 0
    await User.updateMany({ referralId: req.user._id }, { $set: { tax: 0 } });

    // Update the referrer's balance with the sum of their referrals' taxes
    req.user.balance += totalTax;
    await req.user.save();

    return res.status(200).json({
      message: 'تم حصد الأرباح بنجاح وتمت إعادة تعيين الضرائب للمحالين.',
    });
  } catch (error) {
    console.error("Error updating referrer's tax:", error);
    res.status(500).json({ error: 'خطآ في الفحص' });
  }
});

export default router;
