// src/services/walletService.js
import api from '../utils/api';
export const walletService = {
  getBalance: async () => {
    const response = await api.wallet.getBalance();
    return response;
  },

  transfer: async ({ recipient, amount, description, payFee }) => {
    const response = await api.wallet.transfer({
      recipient,
      amount: Number(amount),
      description,
      payFee,
    });
    return response;
  },

  getRates: async () => {
    const response = await api.wallet.getRates();
    return response;
  },
};
