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
import { CloudWatchLogger } from './src/utils/newLogger';

dotenv.config();

const app: Application = express();
const logger = CloudWatchLogger({ logGroupName: "FMC_AMBRIVA_NAME", logStreamName: "TEMP" });

// Middleware setup
app.use(attachJourneyId);
app.use(responseMiddleware);
app.use(rateLimiter);
app.use(loggingMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(setSecurityHeaders); // Security headers
app.use(handleCors); // CORS

// Connect to DB and start server
connectDB()
  .then(() => {
    const PORT = process.env.PORT;
    if (!PORT) {
      throw new Error("PORT is not defined in environment variables");
    }

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      logger.info("server_start", { message: `Server started on port ${PORT}` });
    });
  })
  .catch((error) => {
    console.error(`❌ Failed to connect to MySQL: ${error.message}`);
    logger.error("db_connection_failed", { error: error.message });
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

// Logging test
logger.info("temp_log", {
  data: { test: "test" }
});
