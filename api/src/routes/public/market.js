// api/src/routes/public/trades.js
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Product } from '../../utils/schemas/traderSchema.js';
import User from '../../utils/schemas/mongoUserSchema.js';
import config from '../../config.js';

const defaults = {
  introspection: true,
  formatError: (error) => {
    const { message, extensions } = error;
    return {
      message,
      extensions: {
        code: extensions?.code || 'INTERNAL_SERVER_ERROR',
        ...(config.isProduction ? {} : { stacktrace: extensions?.stacktrace }), // Only include stacktrace in non-production environments
      },
    };
  },
};

const typeDefs_products = `
  type Product {
    _id: ID!
    name: String!
    price: Float!
    openTrades: Int!
    createdAt: String!
    updatedAt: String!
    userId: ID!
  }

  input ProductSort {
    price: SortOrder
    createdAt: SortOrder
    openTrades: SortOrder
  }

  enum SortOrder {
    ASC
    DESC
  }

  type Query {
    searchProducts(
      searchTerm: String
      sort: ProductSort
      limit: Int = 10
      offset: Int = 0
    ): [Product!]!
    
    exploreProducts(
      limit: Int = 10
      offset: Int = 0
    ): [Product!]!
  }
`;

const resolvers_products = {
  Query: {
    searchProducts: async (_, { searchTerm, sort, limit = 10, offset = 0 }) => {
      const query = {
        isLocked: false,
        ...(searchTerm && { name: { $regex: searchTerm, $options: 'i' } }),
      };

      const sortOptions = {};
      if (sort)
        Object.entries(sort).forEach(([field, order]) => {
          sortOptions[field] = order === 'ASC' ? 1 : -1;
        });

      return Product.find(query)
        .sort(sortOptions)
        .limit(Math.min(limit, 25))
        .skip(offset)
        .lean();
    },

    exploreProducts: async (_, { limit = 10, offset = 0 }) => {
      // Simple exploration algorithm:
      // Return products with most open trades first
      return Product.find({ isLocked: false })
        .sort({ openTrades: -1, updatedAt: -1 })
        .limit(Math.min(limit, 25))
        .skip(offset)
        .lean();
    },
  },
};

const typeDefs_users = `
  type User {
    _id: ID!
    username: String!
    profile: Profile
  }

  type Profile {
    profilePicture: String
  }

  type Query {
    getUsers(ids: [ID!]!): [User!]!
  }
`;

const resolvers_users = {
  Query: {
    getUsers: async (_, { ids }) => {
      return User.find(
        { _id: { $in: ids } },
        '_id username profile.profilePicture'
      )
        .limit(25)
        .lean();
    },
  },
};

const server_products = new ApolloServer({
  typeDefs: typeDefs_products,
  resolvers: resolvers_products,
  ...defaults,
});

await server_products.start();

const server_users = new ApolloServer({
  typeDefs: typeDefs_users,
  resolvers: resolvers_users,
  ...defaults,
});

await server_users.start();

const route = express.Router();

route.post('/market/products', expressMiddleware(server_products));
route.post('/market/users', expressMiddleware(server_users));

// Global error handler
route.use((err, req, res, next) => {
  console.error(err); // Log the error for debugging purposes

  res.status(500).json({
    errors: [
      {
        message: 'An unexpected error occurred.',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
    ],
  });
});

export default route;
