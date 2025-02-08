// src/middleware/journeyIdMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const attachJourneyId = (req: Request, res: Response, next: NextFunction) => {
    (req as any).journeyId = req.headers['journey-id'] as string || uuidv4();
    next();
  };
