/**
 * Product Microservice with structured logging
 */

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50052',
        package: ['product', 'category'],
        protoPath: [
          join(__dirname, '../../../proto/product.proto'),
          join(__dirname, '../../../proto/category.proto'),
        ],
      },
    }
  );

  // Используем Winston логгер
  const logger = await app.resolve(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  logger.log('🚀 Product Microservice starting...', 'Bootstrap');
  logger.log(`📡 gRPC Server listening on port 50052`, 'Bootstrap');

  await app.listen();

  logger.log('✅ Product Microservice successfully started', 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Product Microservice:', error);
  process.exit(1);
});
