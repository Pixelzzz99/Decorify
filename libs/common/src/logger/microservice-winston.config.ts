import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import { join } from 'path';

export interface MicroserviceLoggerConfig {
  serviceName: string;
  port: number;
}

export function createMicroserviceLoggerConfig(
  config: MicroserviceLoggerConfig
): WinstonModuleOptions {
  const isDev = process.env.NODE_ENV !== 'production';
  const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');

  const baseFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  );

  const devFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.printf(({ timestamp, level, message, context, trace, ...meta }) => {
      let logMessage = `[${timestamp}] [${config.serviceName}:${config.port}] ${level}: ${message}`;

      if (context) {
        logMessage += ` [${context}]`;
      }

      if (Object.keys(meta).length > 0) {
        logMessage += ` ${JSON.stringify(meta)}`;
      }

      if (trace) {
        logMessage += `\n${trace}`;
      }

      return logMessage;
    })
  );

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: isDev ? devFormat : baseFormat,
      level: logLevel,
    }),
  ];

  // В production добавляем файлы логов
  if (!isDev) {
    const logsDir = join(process.cwd(), 'logs');

    transports.push(
      new winston.transports.File({
        filename: join(logsDir, `${config.serviceName}-error.log`),
        level: 'error',
        format: winston.format.combine(
          baseFormat,
          winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
            return JSON.stringify({
              timestamp,
              service: config.serviceName,
              port: config.port,
              level,
              message,
              context,
              stack,
              ...meta,
            });
          })
        ),
      }),
      new winston.transports.File({
        filename: join(logsDir, `${config.serviceName}-combined.log`),
        format: winston.format.combine(
          baseFormat,
          winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
            return JSON.stringify({
              timestamp,
              service: config.serviceName,
              port: config.port,
              level,
              message,
              context,
              ...meta,
            });
          })
        ),
      })
    );
  }

  return {
    transports,
    format: baseFormat,
    defaultMeta: {
      service: config.serviceName,
      port: config.port,
    },
    exceptionHandlers: [
      new winston.transports.Console({
        format: isDev ? devFormat : baseFormat,
      }),
    ],
    rejectionHandlers: [
      new winston.transports.Console({
        format: isDev ? devFormat : baseFormat,
      }),
    ],
  };
}

// Экспорт готовых конфигураций для каждого сервиса
export const authLoggerConfig = createMicroserviceLoggerConfig({
  serviceName: 'auth',
  port: 50051,
});

export const productLoggerConfig = createMicroserviceLoggerConfig({
  serviceName: 'product',
  port: 50052,
});

export const orderLoggerConfig = createMicroserviceLoggerConfig({
  serviceName: 'order',
  port: 50053,
});

export const paymentLoggerConfig = createMicroserviceLoggerConfig({
  serviceName: 'payment',
  port: 50054,
});

export const vendorLoggerConfig = createMicroserviceLoggerConfig({
  serviceName: 'vendor',
  port: 50055,
});

export const cartLoggerConfig = createMicroserviceLoggerConfig({
  serviceName: 'cart',
  port: 50056,
});
