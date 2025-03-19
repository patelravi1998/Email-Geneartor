import express, { Application, Request, Response } from 'express';
import { connectDB } from './src/config/database';
import { errorHandler } from './src/middleware/errorHandler';
import { loggingMiddleware } from './src/middleware/loggingMiddleware';
import responseMiddleware from './src/middleware/responseMiddleware';
import { attachJourneyId } from './src/middleware/attachJourneyId';
import { notFoundMiddleware } from './src/middleware/notFoundMiddleware';
import { setSecurityHeaders, handleCors, rateLimiter } from './src/middleware/securityMiddleware';
import routes from './src/routes';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app: Application = express();

// Configure multer for handling multipart/form-data
const upload = multer();

// Middleware setup
app.use(attachJourneyId);
app.use(responseMiddleware);
app.use(rateLimiter);
app.use(loggingMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setSecurityHeaders); // Security headers
app.use(handleCors); // CORS

// Use multer for multipart/form-data
app.use(upload.any());

// Connect to DB and start server
connectDB()
  .then(() => {
    const PORT = process.env.PORT;
    if (!PORT) {
      throw new Error("PORT is not defined in environment variables");
    }

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`❌ Failed to connect to MySQL: ${error.message}`);
    process.exit(1);
  });

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Mount API routes
app.use('/api', routes);

// Catch-all route handler for undefined routes
app.use(notFoundMiddleware);

// Error handling middleware
app.use(errorHandler);

export default app;