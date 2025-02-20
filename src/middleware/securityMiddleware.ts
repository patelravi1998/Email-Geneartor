import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errors';

// Helmet for security headers
const helmetMiddleware = helmet({
  contentSecurityPolicy: false, // Disable CSP if causing issues
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'same-origin' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  ieNoOpen: true,
  noSniff: true,
  permittedCrossDomainPolicies: true,
  xssFilter: true,
});

// CORS setup
const corsOptions = {
  origin: ['https://tempemailbox.com/'], // Change in production
  credentials: true, // Allow cookies if needed
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
const corsMiddleware = cors(corsOptions);

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    throw new ApiError(429, 429, "Limit Reached. Stop spamming.");
  },
});

// Middleware exports
export const setSecurityHeaders = helmetMiddleware;
export const handleCors = corsMiddleware;
export const rateLimiter = limiter;
