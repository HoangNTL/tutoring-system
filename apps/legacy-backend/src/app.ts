import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './utils/logger';
import rTracer from 'cls-rtracer';

import testRoutes from './routes/test.routes';
import { globalErrorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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

app.use('/api', testRoutes);

// Global error handling middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
