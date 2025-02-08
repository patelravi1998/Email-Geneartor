// src/types/express.d.ts
import { Request, Response } from 'express';

// Augment the 'express-serve-static-core' module for custom properties
declare module 'express-serve-static-core' {
  interface Request {
    journeyId?: string; // Define your custom property here
    user?: any;
  }

  interface Response {
    sendSuccess: (statusCode: number, message: string, data?: any) => void;
    sendError: (status: number, statusCode: number, message: string, data?: any) => void;
    notFound: () => void;
  }
}


declare global {
  namespace Express {
    interface Request {
      user?: any; // Add your user type here
      journeyId?: string; // Define your custom property here
    }
  }
}

// // Ensure the global namespace is extended
declare global {
  namespace Express {
    interface Response {
      sendSuccess: (statusCode: number, message: string, data?: any) => void;
      sendError: (status: number, statusCode: number, message: string, data?: any) => void;
      notFound: () => void;
    }
  }
}
