// src/resolvers/trade-resolvers.js

export default {
  Query: {
    getProduct: async (_, { productId }) => {
      return {};
    },
    getUserProducts: async (_, { userId }) => {
      return [];
    },
    getProductComments: async (_, { productId }) => {
      return [];
    },
  },
};
