// src/utils/mockData.js

// Helper function to generate random dates within the last 30 days
const getRandomDate = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

// Helper function to generate random transaction amounts
const getRandomAmount = (min = 10, max = 1000) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Generate mock transactions
const generateTransactions = (count = 10) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `tr-${index + 1}`,
    date: getRandomDate(),
    amount: getRandomAmount(),
    type: Math.random() > 0.5 ? 'incoming' : 'outgoing',
    description: Math.random() > 0.5 ? 'تحويل من محمد' : 'دفع لـ أحمد',
    status: 'مكتمل',
  }));
};

// Mock API response delays
const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 500));

// Mock API endpoints
const api = {
  auth: {
    changePassword: async (data) => {
      await mockDelay();
      if (Math.random() > 0.9) {
        throw new Error('فشل تغيير كلمة المرور');
      }
      return { success: true };
    },
  },

  stats: {
    getOverview: async () => {
      await mockDelay();
      const totalTransactions = getRandomAmount(50, 200);
      const totalSpent = getRandomAmount(1000, 5000);
      const totalReceived = getRandomAmount(1000, 5000);

      return {
        totalTransactions,
        totalSpent,
        totalReceived,
      };
    },
  },

  wallet: {
    getBalance: async () => {
      await mockDelay();
      return {
        amount: getRandomAmount(1000, 10000),
        lastUpdated: new Date(),
      };
    },

    transfer: async (data) => {
      await mockDelay();
      if (Math.random() > 0.9) {
        throw new Error('فشل التحويل');
      }
      return { success: true };
    },
  },

  transactions: {
    getAll: async () => {
      await mockDelay();
      return generateTransactions(20);
    },

    getRecent: async () => {
      await mockDelay();
      return generateTransactions(5);
    },
  },
};

export default api;
