import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppError } from './errors/AppError.js';
import { env } from './config/env.js';
import { createCatalogueRouter } from './routes/catalogueRoutes.js';
import { CatalogueController } from './controllers/catalogueController.js';

export function createApp(controller = new CatalogueController()): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Requests without Origin include curl/Postman and same-origin requests.
        if (!origin || env.clientOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin is not allowed by CORS.'));
      },
    }),
  );
  app.use(express.json({ limit: '20kb' }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', createCatalogueRouter(controller));

  app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

  app.use(
    (error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.statusCode >= 500 ? 'The service is temporarily unavailable. Please try again.' : error.message });
        return;
      }
      if (error instanceof SyntaxError) {
        res.status(400).json({ error: 'Request body must contain valid JSON.' });
        return;
      }
      console.error('[API ERROR]', error);
      res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
    },
  );

  return app;
}

export const app = createApp();
