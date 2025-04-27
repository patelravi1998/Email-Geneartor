// src/utils/logger.ts

import winston from 'winston';
import { format } from 'winston';
import AWS from 'aws-sdk'; // Import AWS SDK
import WinstonCloudWatch from 'winston-cloudwatch'; // Import WinstonCloudWatch
import dotenv from 'dotenv';

dotenv.config();

const { combine, timestamp, printf } = format;

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Validate environment variables
if (process.env.CLOUDWATCH_LOGGING_ENABLED === 'true') {
    if (!process.env.LOG_GROUP_NAME || !process.env.LOG_STREAM_NAME) {
      throw new Error('CloudWatch logging is enabled but LOG_GROUP_NAME or LOG_STREAM_NAME is not configured.');
    }
  }

// Configure Winston transports based on environment
const transports = [];

// Console transport (always enabled in development)
if (process.env.NODE_ENV === 'DEVELOPMENT' || process.env.NODE_ENV === 'LOCAL') {
    transports.push(
      new winston.transports.Console({
        format: combine(
          winston.format.colorize(),
          winston.format.simple(),
          timestamp(),
          logFormat
        )
      })
    );
  }

// File transport (enabled if LOGGING_ENABLED is true)
if (process.env.LOGGING_ENABLED === 'true') {
  transports.push(
    new winston.transports.File({
      filename: process.env.LOG_FILE_PATH,
      format: combine(
        timestamp(),
        logFormat
      )
    })
  );
}

// CloudWatch transport (enabled if CLOUDWATCH_LOGGING_ENABLED is true)
if (process.env.CLOUDWATCH_LOGGING_ENABLED === 'true') {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });

  const cloudWatchLogsOptions = {
    logGroupName: process.env.NODENV+'-'+process.env.LOG_GROUP_NAME,
    logStreamName: process.env.NODENV+'-'+process.env.LOG_STREAM_NAME,
    awsRegion: process.env.AWS_REGION || 'us-east-1'
  };

  // transports.push(
  //   new WinstonCloudWatch(cloudWatchLogsOptions)
  // );
}

// Create Winston logger instance
const logger = winston.createLogger({
  transports: transports,
});

export default logger;
