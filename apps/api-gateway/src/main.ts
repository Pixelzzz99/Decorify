/**
 * Decorify Marketplace API Gateway
 * Production-ready microservices gateway with HTTPS support
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import compression from 'compression';
import { winstonConfig, productionWinstonConfig } from './common/logger/winston.config';
import { getHttpsOptions } from './common/https/https.config';

import { AppModule } from './app/app.module';

async function bootstrap() {
  // Choose logger configuration based on environment
  const isProduction = process.env.NODE_ENV === 'production';
  const loggerConfig = isProduction ? productionWinstonConfig : winstonConfig;

  // Get HTTPS options if enabled
  const httpsOptions = getHttpsOptions();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
    ...(httpsOptions && { httpsOptions }),
  });

  // Production security middleware
  if (isProduction) {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }));
  } else {
    // Development mode - less restrictive helmet
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
  }

  // Compression middleware
  app.use(compression());

  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS configuration
  const allowedOrigins = isProduction
    ? (process.env.ALLOWED_ORIGINS?.split(',') || [])
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4200'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: isProduction ? 86400 : 0, // 24 hours in production, no cache in dev
  });

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Decorify Marketplace API')
    .setDescription(`
      Decorify - это современный маркетплейс мебели с микросервисной архитектурой.

      ## Основные возможности:
      - 🔐 Аутентификация и авторизация
      - 🛍️ Управление товарами и категориями
      - 🛒 Корзина покупок
      - 📦 Управление заказами
      - 💳 Интеграция с платежными системами
      - 🏪 Система поставщиков

      ## Архитектура:
      - **API Gateway** - единая точка входа
      - **Auth Service** - аутентификация пользователей
      - **Product Service** - товары и категории
      - **Order Service** - управление заказами
      - **Payment Service** - обработка платежей
      - **Vendor Service** - управление поставщиками
      - **Cart Service** - корзина покупок
    `)
    .setVersion('1.0')
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('products', 'Товары и управление каталогом')
    .addTag('categories', 'Категории товаров')
    .addTag('orders', 'Заказы и управление ими')
    .addTag('cart', 'Корзина покупок')
    .addTag('payments', 'Платежи и транзакции')
    .addTag('vendors', 'Поставщики и магазины')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Введите JWT токен',
      },
      'JWT-auth'
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.decorify.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Decorify API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #1976d2; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const protocol = httpsOptions ? 'https' : 'http';
  Logger.log(`🚀 Application is running on: ${protocol}://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 API Documentation is available at: ${protocol}://localhost:${port}/docs`);
  Logger.log(`🔒 HTTPS is ${httpsOptions ? 'ENABLED' : 'DISABLED'}`);
}

bootstrap();
