// api/src/routes/graphql/market.js
import path from 'path';
import { Router } from 'express';
import { readFileSync } from 'fs';
import { buildSchema } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { authenticateTokenMiddleware } from '../../utils/authenticateToken.js';

// Dynamically load schema from a separate file
const schemaPath = path.resolve('./market-schema.graphql');
const schemaSDL = readFileSync(schemaPath, 'utf-8');
const schema = buildSchema(schemaSDL);

// Import resolvers
import resolvers from './market-resolvers.js';

function requireAppWs(app, ws) {
  const router = Router();

  router.use(
    '/graphql/market',
    (req, res, next) => {
      authenticateTokenMiddleware(req, res, next, (error) => {
        req.authenticateTokenMiddlewareError = error;
      });
    },
    createHandler({
      schema,
      rootValue: resolvers,
      context: (req, res) => ({
        req,
        res,
        ws,
        app,
      }),
    })
  );

  return router;
}

export default requireAppWs;
