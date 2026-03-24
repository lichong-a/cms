import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { errorHandler, notFoundHandler } from '../middleware/error.middleware';
import { tenantMiddleware } from '../middleware/tenant';
import routes from '../routes';

// Create test app without starting server
const createTestApp = () => {
  const app = express();

  // Basic middleware
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Tenant middleware
  app.use(tenantMiddleware);

  // API routes
  app.use('/api/v1', routes);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
};

export default createTestApp();
