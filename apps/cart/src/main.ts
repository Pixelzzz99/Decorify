/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { join } from 'path';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50056',
        package: 'cart',
        protoPath: join(__dirname, '/proto/cart.proto'),
      },
    }
  );
  Logger.log(`🚀 Microservice is running on: http://localhost:50056/`);
  await app.listen();
}

bootstrap();
