/**
 * Order Microservice with structured logging and health checks
 */

import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app/app.module';
import { join } from 'path';
import { HealthCheckServer, getHealthCheckPort } from '@sofa-web/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: '0.0.0.0:50053',
        package: 'order',
        protoPath: join(__dirname, '../../../proto/order.proto'),
      },
    }
  );

  // Используем Winston логгер
  const logger = await app.resolve(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Запускаем health check сервер для Railway
  const healthCheckPort = getHealthCheckPort('order');
  const healthServer = new HealthCheckServer({
    serviceName: 'order',
    port: healthCheckPort,
    grpcPort: 50053,
    customChecks: async () => ({
      database: 'connected', // TODO: Add real DB health check
      grpc: 'ready'
    })
  });

  await healthServer.start();

  logger.log('🚀 Order Microservice starting...', 'Bootstrap');
  logger.log(`📡 gRPC Server listening on port 50053`, 'Bootstrap');
  logger.log(`🔍 Health check available on port ${healthCheckPort}`, 'Bootstrap');

  await app.listen();

  logger.log('✅ Order Microservice successfully started', 'Bootstrap');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('🛑 Shutting down Order Microservice...', 'Bootstrap');
    await healthServer.stop();
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Order Microservice:', error);
  process.exit(1);
});
