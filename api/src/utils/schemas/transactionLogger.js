// my-api/src/utils/schemas/transactionLogger.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    maxLength: 255,
    default: '',
  },
  type: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },
  feeAmount: {
    type: Number,
    required: true,
  },
  payerPaidFee: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model('Transaction', transactionSchema);
import User from './mongoUserSchema.js';
const TRANSACTION_LIMIT = 40;

// Cleanup function to maintain only the latest transactions
const cleanupOldTransactions = async (userId) => {
  try {
    const count = await Transaction.countDocuments({
      $or: [{ senderId: userId }, { recipientId: userId }],
    });

    if (count > TRANSACTION_LIMIT) {
      const transactions = await Transaction.find({
        $or: [{ senderId: userId }, { recipientId: userId }],
      })
        .sort({ createdAt: -1 })
        .skip(TRANSACTION_LIMIT);

      const transactionIds = transactions.map((t) => t._id);
      await Transaction.deleteMany({ _id: { $in: transactionIds } });
    }
  } catch (error) {
    console.error('Error cleaning up old transactions:', error);
  }
};

/**
 * Logs a transaction for a sender and recipient.
 *
 * @param {Object} params - Transaction details.
 * @param {User} params.sender - The sender user object.
 * @param {User} params.recipient - The recipient user object.
 * @param {number} params.amount - The transaction amount.
 * @param {string} [params.description=""] - A description for the transaction.
 * @param {number} params.feeAmount - The fee amount associated with the transaction.
 * @param {boolean} params.payerPaidFee - Indicates if the payer paid the transaction fee.
 * @returns {Promise<Boolean>} - Returns `true` if the transaction was logged successfully, `false` otherwise.
 */
export const logTransaction = async ({
  sender,
  recipient,
  amount,
  description,
  feeAmount,
  payerPaidFee,
}) => {
  try {
    // Create two transaction records - one for sender and one for recipient
    const senderTransaction = new Transaction({
      senderId: sender._id,
      recipientId: recipient._id,
      amount,
      description,
      type: 'outgoing',
      feeAmount,
      payerPaidFee,
    });

    await Promise.all([senderTransaction.save()]);

    // Cleanup old transactions for both sender and recipient
    await Promise.all([
      cleanupOldTransactions(sender._id),
      cleanupOldTransactions(recipient.id),
    ]);

    return true;
  } catch (error) {
    console.error('Error logging transaction:', error);
    return false;
  }
};

// Get transactions for a specific user
export const getUserTransactions = async (
  userId,
  { limit = TRANSACTION_LIMIT, skip = 0 } = {}
) => {
  try {
    // Ensure we don't fetch more than the maximum stored transactions
    const actualLimit = Math.min(limit, TRANSACTION_LIMIT);

    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(actualLimit)
      .populate('senderId recipientId', 'username')
      .lean();

    // Transform transactions for display
    return transactions.map((transaction) => {
      const isOutgoing =
        transaction.senderId._id.toString() === userId.toString();
      return {
        id: transaction._id,
        date: transaction.createdAt,
        amount: transaction.amount,
        type: isOutgoing ? 'outgoing' : 'incoming',
        description: transaction.description,
        status: transaction.status,
        feeAmount: transaction.feeAmount,
        payerPaidFee: transaction.payerPaidFee,
        otherParty: isOutgoing
          ? transaction.recipientId.username
          : transaction.senderId.username,
      };
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return [];
  }
};

export default {
  Transaction,
  logTransaction,
  getUserTransactions,
};
