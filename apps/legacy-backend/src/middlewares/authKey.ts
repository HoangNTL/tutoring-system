import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const authApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Allow preflight requests to pass through without API key check
  if (req.method === 'OPTIONS') {
    return next();
  }

  const apiKey = req.headers['x-api-key'];
  const secret = process.env.CORE_BACKEND_API_KEY;

  // Check if the API key is configured
  if (!secret) {
    logger.error('[Configuration Error] CORE_BACKEND_API_KEY is not set.');
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error: Missing Configuration',
    });
  }

  // Validate the API key
  if (!apiKey || apiKey !== secret) {
    logger.warn(
      `[Unauthorized] Access denied. IP: ${req.ip} - URL: ${req.originalUrl} - Key: ${apiKey ?? 'N/A'}`,
    );

    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid or missing API Key',
    });
  }

  next();
};
