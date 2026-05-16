import { NextFunction, Request, Response } from 'express';

import { env } from '@/config/env';
import logger from '@/shared/logger';
import { errorResponse } from '@/shared/response';

export const authApiKey = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const apiKey = req.headers['x-api-key'];

  if (!env.coreBackendApiKey) {
    logger.error('[Configuration Error] CORE_BACKEND_API_KEY is not set.');

    return errorResponse(
      res,
      'Internal Server Error: Missing Configuration',
      500,
    );
  }

  if (!apiKey || apiKey !== env.coreBackendApiKey) {
    logger.warn(
      `[Unauthorized] Access denied. IP: ${req.ip} - URL: ${req.originalUrl} - Key: ${apiKey ?? 'N/A'}`,
    );

    return errorResponse(res, 'Forbidden: Invalid or missing API Key', 403);
  }

  next();
};
