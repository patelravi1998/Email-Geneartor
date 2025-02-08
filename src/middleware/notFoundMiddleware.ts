// src/middleware/notFoundMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.notFound();
};

