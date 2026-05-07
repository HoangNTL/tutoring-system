import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './utils/logger';

import testRoutes from './routes/test.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// configure morgan for development logging
app.use(
  morgan(
    ':method :url :status :response-time ms - :res[content-length] bytes',
    {
      stream: { write: (message) => logger.info(`[HTTP] ${message.trim()}`) },
    },
  ),
);

app.use('/api', testRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
