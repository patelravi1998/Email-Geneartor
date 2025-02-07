// responseMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const responseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.sendSuccess = (status: number, message: string, data?: any) => {
    res.status(status).json({ status:true, message, data,referenceId:req.journeyId, });
  };

  res.sendError = (status: number,statusCode:number = status, message: string, data?: any) => {
    logger.info(JSON.stringify(data));
    res.status(status).json({
      status: false,
      error: {
        code: statusCode,
        message,
      },
      referenceId:req.journeyId,
      // data
    });
  }
    
  res.notFound = () => {
    res.status(404).json({ status: false, message: 'Not Found',error: {
      code: 404,
      message:"Not Found",
    }, referenceId:req.journeyId,});
  };

  next();
};

export default responseMiddleware;