// my-react-app/src/utils/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API; // You can easily change this when deploying

import { errorRedirects } from '../errorConfig.jsx'; // Import the errorRedirects array

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // If the error has a response from the server
    if (error.response) {
      const { status } = error.response;

      // Check if the error code is in the errorRedirects array
      const redirect = errorRedirects.find((err) => err.code === status);
      if (redirect) {
        // Redirect the user to the specified path
        window.location.pathname = redirect.path;
      }

      // Return the error response data to preserve the structure
      // This allows us to access error.response.data.errors in components
      return Promise.reject(error.response);
    }
    // For network errors or other issues
    return Promise.reject(new Error(error.message || 'Network error'));
  }
);

const api = {
  cheques: {
    create: async (data) => axiosInstance.post('/api/auth/@me/cheque', data),
    claim: async (data) => axiosInstance.post('/api/auth/cheque/claim', data),
    getAll: async (page = 1, limit = 10) =>
      axiosInstance.get(`/api/auth/@me/cheques?page=${page}&limit=${limit}`),
  },
  mysteryGifts: {
    create: async (data) =>
      axiosInstance.post('/api/auth/@me/mystery-gift', data),
    try: async (data) => axiosInstance.post('/api/auth/mystery-gift/try', data),
    getAll: async (page = 1, limit = 10) =>
      axiosInstance.get(
        `/api/auth/@me/mystery-gifts?page=${page}&limit=${limit}`
      ),
  },
  engagement: {
    me: async () => axiosInstance.get(`/api/auth/@me/engagement`),
  },
  top: {
    rich: async (page, limit) =>
      axiosInstance.get(`/api/public/richest?page=${page}&limit=${limit}`),
  },
  userData: {
    profile: async (username) =>
      axiosInstance.get(`/api/public/${username}/profile`),
    wallet: async (username) =>
      axiosInstance.get(`/api/public/${username}/wallet`),
    products: async (username) =>
      axiosInstance.get(`/api/public/${username}/products`),
    product: async (username, id) =>
      axiosInstance.get(`/api/public/${username}/products/${id}`),
  },
  products: {
    getAll: async () => axiosInstance.get('/api/auth/products'),
    getOne: async (id) => axiosInstance.get(`/api/auth/products/${id}`),
    create: async (data) => axiosInstance.post('/api/auth/products', data),
    update: async (id, data) =>
      axiosInstance.put(`/api/auth/products/${id}`, data),
    delete: async (id) => axiosInstance.delete(`/api/auth/products/${id}`),
  },
  apps: {
    verifyConnection: async (data) => {
      return axiosInstance.post('/api/auth/@me/apps/verifyConnection', data);
    },
    getApps: async () => {
      return axiosInstance.get('/api/auth/@me/apps');
    },
    disconnect: async (data) => {
      return axiosInstance.put('/api/auth/@me/apps/disconnect', data);
    },
    image: async (data) => {
      return axiosInstance.post('/api/auth/@me/images', data);
    },
  },
  help: async (data) => {
    return axiosInstance.post('/api/auth/@me/help', data);
  },
  profile: {
    get: async () => {
      return axiosInstance.get('/api/auth/@me/profile');
    },
    update: async (profile) => {
      return axiosInstance.put('/api/auth/@me/profile', profile);
    },
  },
  privacy: {
    getSettings: async () => {
      return axiosInstance.get('/api/auth/@me/privacy');
    },
    updateSettings: async (settings) => {
      return axiosInstance.put('/api/auth/@me/privacy', settings);
    },
  },
  airdrop: {
    getGifts: async () => {
      return axiosInstance.get('/api/auth/airdrop');
    },
    claimGift: async (id) => {
      return axiosInstance.post(`/api/auth/@me/airdrop/${id}`);
    },
    createGift: async (giftData) => {
      return axiosInstance.post('/api/auth/airdrop/create', giftData);
    },
  },
  donations: {
    getSettings: async () => {
      return axiosInstance.get('/api/auth/@me/donations');
    },
    updateSettings: async (settings) => {
      return axiosInstance.put('/api/auth/@me/donations', settings);
    },
    getPublicPage: async (username) => {
      return axiosInstance.get(`/api/auth/tip/${username}`);
    },
  },
  tasks: {
    getDaily: async (host) => {
      return axiosInstance.get('/api/auth/@me/daily', {
        params: { host },
      });
    },
    verifyDaily: async (dailyCode) => {
      return axiosInstance.get('/api/auth/verify-daily', {
        params: { dailyCode },
      });
    },
  },
  affiliate: {
    getReferrals: async () => {
      return axiosInstance.get('/api/auth/@me/referrals');
    },
    collectTaxes: async () => {
      return axiosInstance.put('/api/auth/@me/taxes');
    },
  },
  auth: {
    login: async (credentials) => {
      return axiosInstance.post('/login', credentials);
    },
    signup: async (credentials) => {
      return axiosInstance.post('/signup', credentials);
    },
    getMe: async () => {
      return axiosInstance.get('/@me');
    },
  },
  wallet: {
    getBalance: async () => {
      return axiosInstance.get('/api/auth/@me/wallet');
    },
    transfer: async (data) => {
      return axiosInstance.post('/api/auth/@me/wallet', data);
    },
    getRates: async () => {
      return axiosInstance.get('/api/public/walletRates');
    },
  },
  transactions: {
    getAll: async (page = 1, limit = 20) => {
      return axiosInstance.get(`/api/auth/@me/transactions`, {
        params: { page, limit },
      });
    },
    getRecent: async (limit = 5) => {
      return axiosInstance.get(`/api/auth/@me/transactions`, {
        params: { page: 1, limit },
      });
    },
  },
  stats: {
    getOverview: async () => {
      return axiosInstance.get(`/api/auth/@me/overview`);
    },
  },
  security: {
    getBackupCodes: async (data) => {
      return axiosInstance.post('/api/auth/@me/security/backup-codes', data);
    },
    removeRecovery: async (data) => {
      return axiosInstance.post('/api/auth/@me/security/remove-recovery', data);
    },
    changePassword: async (data) => {
      return axiosInstance.post('/api/auth/@me/security/password', data);
    },
    changeUsername: async (data) => {
      return axiosInstance.post('/api/auth/@me/security/username', data);
    },
    verify: async (data) => {
      return axiosInstance.post('/api/auth/@me/security/verify', data);
    },
    getSettings: async () => {
      return axiosInstance.get('/api/auth/@me/security/settings');
    },
    recovery: {
      verify: async (data) => {
        return axiosInstance.post('/api/public/recovery/verify', data);
      },
      reset: async (data) => {
        return axiosInstance.post('/api/public/recovery/reset', data);
      },
    },
  },
  API_BASE_URL,
};

export default api;
