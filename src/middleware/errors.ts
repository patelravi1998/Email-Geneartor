// src/errors/ApiError.ts
export class ApiError extends Error {
    status: number;
    statusCode: number;
    details?: any;
  
    constructor(status: number, statusCode:number,message: string, details?: any) {
      super(message);
      this.status = status;
      this.statusCode = statusCode;
      this.details = details;
    }
  }
  