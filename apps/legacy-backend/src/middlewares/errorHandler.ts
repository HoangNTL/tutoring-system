import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;

  logger.error(err.message, {
    metadata: {
      method: req.method,
      url: req.url,
      status: statusCode,
      stack: err.stack,
    },
  });

  res.status(statusCode).json({
    success: false,
    message: err.message.replace(/^Error: /i, ''),
  });
};
