/**
 * Vendor Microservice with structured logging
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
        url: '0.0.0.0:50055',
        package: 'vendor',
        protoPath: join(__dirname, '../../../proto/vendor.proto'),
      },
    }
  );

  // Используем Winston логгер
  const logger = await app.resolve(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  logger.log('🚀 Vendor Microservice starting...', 'Bootstrap');
  logger.log(`📡 gRPC Server listening on port 50055`, 'Bootstrap');
  
  await app.listen();
  
  logger.log('✅ Vendor Microservice successfully started', 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Vendor Microservice:', error);
  process.exit(1);
});
