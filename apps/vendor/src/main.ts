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
        url: '0.0.0.0:50052',
        package: 'vendor',
        protoPath: join(__dirname, '/proto/vendor.proto'),
      },
    }
  );
  Logger.log(`🚀 Microservice is running on: http://localhost:50052/`);
  await app.listen();
}

bootstrap();
