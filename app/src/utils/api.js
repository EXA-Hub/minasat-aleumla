// my-react-app/src/utils/api.js
import React from 'react';
import axios from 'axios';
import SHA256 from 'crypto-js/sha256';
import { createRoot } from 'react-dom/client';
import errors from '../errorConfig';

// Create a function to dynamically import the ErrorWidget
const showErrorWidget = async (errorData, resData) => {
  const root = document.createElement('div');
  root.id = 'error-widget-root';
  document.body.appendChild(root);

  // Dynamically import the ErrorWidget component
  const { default: ErrorWidget } = await import('../components/ErrorWidget');

  createRoot(root).render(
    React.createElement(ErrorWidget, {
      error: errorData,
      response: resData,
      onClose: () => document.body.removeChild(root),
    })
  );
};

const API_BASE_URL = import.meta.env.VITE_API;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

function generateCacheKey(config) {
  const keyData = {
    method: config.method?.toLowerCase(),
    url: config.url,
    params: config.params || null,
    data: config.data || null,
    token: localStorage.getItem('token'),
  };

  const string = Object.entries(keyData)
    .filter(([, value]) => value !== null)
    .map(
      ([key, value]) =>
        `${key}:${value !== null && (Array.isArray(value) || typeof value === 'object') ? JSON.stringify(value) : value}`
    )
    .join('|');

  const hash = SHA256(string).toString();

  // console.log(string, hash);
  // Hash the key string using SHA-256 from crypto-js
  return hash;
}

const cache = new Map(); // In-memory cache
const cacheTimeout = 10 * 60 * 1000;
const cleanUpCache = () => {
  const now = Date.now();
  for (const [key, { timestamp }] of cache.entries())
    if (now - timestamp > cacheTimeout) cache.delete(key); // Remove entries older than 5 seconds
};

// Add request interceptor to handle auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const key = generateCacheKey(config);
    const cachedResponse = cache.get(key);
    if (cachedResponse && Date.now() - cachedResponse.timestamp < cacheTimeout)
      throw new axios.Cancel('cached-response-found' + key); // Short-circuit the request
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (import.meta.env.DEV) console.log('New Request:', config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    cleanUpCache();
    const key = generateCacheKey(response.config);
    if (import.meta.env.DEV) console.log('Cacheing Response:', response);
    cache.set(key, { response: response.data, timestamp: Date.now() });
    return response.data; // Return only the response data
  },
  async (error) => {
    if (
      axios.isCancel(error) &&
      error.message.startsWith('cached-response-found')
    ) {
      if (import.meta.env.DEV) console.log('🚀 Using Cache');
      return Promise.resolve(
        cache.get(error.message.replace('cached-response-found', '')).response
      );
    } else if (error.response) {
      const { status, data } = error.response;
      const errorData = errors.find((err) => err.code === status);
      if (errorData)
        if (errorData.path) window.location.href = errorData.path;
        else await showErrorWidget(errorData, data);
      return Promise.reject(error.response);
    }
    return Promise.reject(new Error(error.message || 'خطأ في الاتصال بالخادم'));
  }
);

const api = {
  donate: {
    create: async (data) => axiosInstance.post('/api/auth/@me/donate/' + data),
    donators: async () => axiosInstance.get('/api/public/donators'),
  },
  plans: {
    getAll: async () => axiosInstance.get('/api/public/plans'),
    subscribe: async (plan) =>
      axiosInstance.post(`/api/auth/@me/plan/subscribe/${plan}`),
    claim: async (code) =>
      axiosInstance.post('/api/auth/@me/plan/claim', { code }),
    cancel: async () => axiosInstance.post('/api/auth/@me/plan/cancel'),
    generateCode: async (plan, quantity) =>
      axiosInstance.post('/api/auth/@me/plan/generate-code', {
        plan,
        quantity,
      }),
    getCodes: async (page = 1, limit = 10) =>
      axiosInstance.get(`/api/auth/@me/plan/codes?page=${page}&limit=${limit}`),
  },
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
