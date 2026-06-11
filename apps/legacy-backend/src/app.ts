import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rTracer from 'cls-rtracer';

import { env } from '@/config/env';
import { globalErrorHandler } from '@/middlewares/errorHandler';
import { authApiKey } from '@/middlewares/authApiKey';
import departmentRouter from '@/modules/departments/department.routes';
import lecturerRouter from '@/modules/lecturers/lecturer.routes';
import periodRouter from '@/modules/periods/period.routes';
import studentRouter, { studentLegacyRouter } from '@/modules/students/student.routes';
import logger from '@/shared/logger';

const app = express();
const host = '127.0.0.1';

app.use(express.json());

app.use(
  cors({
    origin: env.coreBackendUrl,
    methods: ['GET'],
    allowedHeaders: ['x-api-key', 'Content-Type'],
    credentials: true,
  }),
);

app.use(
  morgan(
    ':method :url :status :response-time ms - :res[content-length] bytes',
    {
      skip: (req, res) => res.statusCode >= 400,
      stream: { write: (message) => logger.info(`[HTTP] ${message.trim()}`) },
    },
  ),
);
app.use(rTracer.expressMiddleware());

app.use(authApiKey);
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/legacy/students', studentLegacyRouter);
app.use('/api/v1/lecturers', lecturerRouter);
app.use('/api/v1/departments', departmentRouter);
app.use('/api/v1/legacy/periods', periodRouter);
app.use(globalErrorHandler);

app.listen(env.port, host, () => {
  logger.info(`Server is running on http://${host}:${env.port}`);
});
