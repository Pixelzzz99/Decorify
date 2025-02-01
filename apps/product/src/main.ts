/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50053',
        package: ['product', 'category'],
        protoPath: [
          join(__dirname, '/proto/product.proto'),
          join(__dirname, '/proto/category.proto'),
        ],
      },
    }
  );

  Logger.log(`🚀 Microservice is running on: http://localhost:50053/`);
  await app.listen();
}

bootstrap();
