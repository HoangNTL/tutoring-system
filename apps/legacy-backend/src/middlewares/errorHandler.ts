import { Request, Response, NextFunction } from 'express';

import logger from '@/shared/logger';
import { errorResponse } from '@/shared/response';

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

  return errorResponse(
    res,
    err.message.replace(/^Error: /i, ''),
    statusCode,
  );
};
