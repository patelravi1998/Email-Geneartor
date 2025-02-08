import helmet from 'helmet';
import cors from 'cors';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errors';

// Helmet middleware configuration
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'same-origin',
  },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // Must be at least 1 year to be approved by browsers
    includeSubDomains: true, // Must be enabled to be approved by browsers
    preload: true,
  },
  ieNoOpen: true, // X-Download-Options for IE8+
  noSniff: true, // X-Content-Type-Options nosniff
  permittedCrossDomainPolicies: true, // X-Permitted-Cross-Domain-Policies
  xssFilter: true, // X-XSS-Protection
});

// CORS middleware configuration
const corsOptions = {
  origin: '*', // Replace with your frontend URL in production
};
const corsMiddleware = cors(corsOptions);

// CSRF middleware configuration
const csrfMiddleware = csrf({ cookie: true });

// Rate limiting middleware configuration
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    throw new ApiError(429, 429, "Limit Reached, Spamming , You have tried multiple times.")
  },
});

// Middleware to set security headers
export const setSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  helmetMiddleware(req, res, next);
};

// Middleware to handle CORS
export const handleCors = (req: Request, res: Response, next: NextFunction) => {
  corsMiddleware(req, res, next);
};

// Middleware to handle CSRF protection
export const handleCsrfProtection = (req: Request, res: Response, next: NextFunction) => {
  csrfMiddleware(req, res, next);
};

// Middleware for rate limiting
export const rateLimiter = limiter;
