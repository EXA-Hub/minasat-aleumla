import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ws } from './utils/webhook.js';
import handler from './routes/jobs/ExpiredSubscriptions.js';

export const loadRoutes = async (app, { authenticateToken }) => {
  const loadRoutesFromDir = async (dir, basePath = '', requireAuth = false) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        await loadRoutesFromDir(fullPath, `${basePath}/${file}`, requireAuth);
        continue;
      }

      if (!file.endsWith('.js')) continue;
      const routeModule = await import(fullPath);
      if (!routeModule.default) continue;
      const exported =
        routeModule.default.name === 'requireAppWs'
          ? routeModule.default(app, ws)
          : routeModule.default;
      if (requireAuth) app.use(basePath, authenticateToken, exported);
      else app.use(basePath, exported);
    }
  };

  const baseDir = path.dirname(fileURLToPath(import.meta.url));

  // Load routes separately to maintain proper auth context
  await loadRoutesFromDir(
    path.join(baseDir, 'routes', 'auth'),
    '/api/auth',
    true
  );
  await loadRoutesFromDir(
    path.join(baseDir, 'routes', 'public'),
    '/api/public'
  );
  await loadRoutesFromDir(
    path.join(baseDir, 'routes', 'bots'),
    '/webhooks/bots'
  );

  // cron job
  app.get('/src/routes/jobs/ExpiredSubscriptions.js', handler);
};
