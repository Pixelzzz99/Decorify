import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // Console transport
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, context, trace, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
          const traceString = trace ? `\n${trace}` : '';
          return `${timestamp} [${context || 'Application'}] ${level}: ${message} ${metaString}${traceString}`;
        }),
      ),
    }),

    // File transport for errors
    new winston.transports.File({
      level: 'error',
      filename: 'logs/error.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],

  // Exit on handled exceptions
  exitOnError: false,

  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],

  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};

// Production optimized config
export const productionWinstonConfig: WinstonModuleOptions = {
  transports: [
    // JSON formatted console for production (easier to parse by log aggregators)
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'warn',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf((info) => {
          return JSON.stringify({
            timestamp: info.timestamp,
            level: info.level,
            message: info.message,
            context: info.context,
            service: 'api-gateway',
            environment: process.env.NODE_ENV,
            ...info,
          });
        }),
      ),
    }),

    // File transport for errors in production
    new winston.transports.File({
      level: 'error',
      filename: 'logs/error.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],

  exitOnError: false,
};
