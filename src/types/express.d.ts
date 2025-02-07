// src/types/express.d.ts
import { Request,Response } from 'express';

// Augment the 'express-serve-static-core' module for custom properties
declare module 'express-serve-static-core' {
  interface Request {
    journeyId?: string; // Define your custom property here
  }

  interface Response {
    sendSuccess: (statusCode: number, message: string,data?: any) => void;
    sendError: (status: number,statusCode: number, message: string,data?: any) => void;
    notFound: () => void;
  }
}

// // Ensure the global namespace is extended
// declare global {
//   namespace Express {
//     interface Response {
//       sendSuccess?: (data?: any) => void;
//       sendError?: (statusCode: number, message: string) => void;
//       notFound?: () => void;
//     }
//   }
// }
