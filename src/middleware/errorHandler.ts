// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
// import logger from '../utils/logger'; // Import Winston logger
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating journeyId
import { ApiError } from './errors';

// Error handler middleware
export const errorHandler = (
  error: Error,
  req: Request & { journeyId?: string }, // Extend Request type to include journeyId
  res: Response,
  next: NextFunction
) => {
  const journeyId = req.journeyId || uuidv4(); // Generate journeyId if not already present

  // logger.error(`[${journeyId}] Error occurred: ${error.message}`); // Log the error with journeyId

  // Log the stack trace for debugging purposes
  // logger.debug(`[${journeyId}] Error stack trace: ${error.stack}`);

  // Customize error response based on the type of error or status code
  // const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = error instanceof ApiError ? error.message : 'Internal server error';
  const status = error instanceof ApiError ? error.status : 500;
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  res.sendError(status,statusCode,message,process.env.NODE_ENV === 'production' ? '🍰' : error.stack);
};
