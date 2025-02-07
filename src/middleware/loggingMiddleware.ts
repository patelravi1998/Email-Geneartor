// src/middleware/loggingMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator
import logger from '../utils/logger'; // Adjust path as needed

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const journeyId = uuidv4(); // Generate unique journey ID

  // Log request details
  logger.info(`[${journeyId}] Request: ${req.method} ${req.originalUrl}`);

  const start = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    const { statusCode } = res;

    // Log response details
    logger.info(`[${journeyId}] Response: ${statusCode} ${responseTime}ms`);
  });

  // Attach journeyId to request for downstream use
  (req as any).journeyId = journeyId;

  next();
};
