/**
 * Cart Microservice with structured logging
 */

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app/app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50056',
        package: 'cart',
        protoPath: join(__dirname, '../../../proto/cart.proto'),
      },
    }
  );

  // Используем Winston логгер
  const logger = await app.resolve(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  logger.log('🚀 Cart Microservice starting...', 'Bootstrap');
  logger.log(`📡 gRPC Server listening on port 50056`, 'Bootstrap');
  
  await app.listen();
  
  logger.log('✅ Cart Microservice successfully started', 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Cart Microservice:', error);
  process.exit(1);
});
