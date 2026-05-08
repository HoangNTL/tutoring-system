import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import rTracer from 'cls-rtracer';

import logger from './utils/logger';
// import testRoutes from './routes/test.routes';
import { globalErrorHandler } from './middlewares/errorHandler';
import { authApiKey } from './middlewares/authKey';
import rootRouter from './routes/index';

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.CORE_BACKEND_URL || 'http://localhost:8000',
    methods: ['GET'], // Allow only GET requests
    allowedHeaders: ['x-api-key', 'Content-Type'],
    credentials: true,
  }),
);

// configure morgan for development logging
app.use(
  morgan(
    ':method :url :status :response-time ms - :res[content-length] bytes',
    {
      skip: (req, res) => res.statusCode >= 400, // Skip logging for errors, we'll log them in the error handler
      stream: { write: (message) => logger.info(`[HTTP] ${message.trim()}`) },
    },
  ),
);
app.use(rTracer.expressMiddleware()); // Add CLS context to each request

// Apply API key authentication middleware globally to all routes
app.use(authApiKey);

// Mount the root router
app.use('/api', rootRouter);

// Global error handling middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
