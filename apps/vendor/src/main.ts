/**
 * Vendor Microservice with structured logging and health checks
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
        url: '0.0.0.0:50055',
        package: 'vendor',
        protoPath: join(__dirname, '../../../proto/vendor.proto'),
      },
    }
  );

  // Используем Winston логгер
  const logger = await app.resolve(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Запускаем health check сервер для Railway
  const healthCheckPort = getHealthCheckPort('vendor');
  const healthServer = new HealthCheckServer({
    serviceName: 'vendor',
    port: healthCheckPort,
    grpcPort: 50055,
    customChecks: async () => ({
      database: 'connected', // TODO: Add real DB health check
      grpc: 'ready'
    })
  });

  await healthServer.start();

  logger.log('🚀 Vendor Microservice starting...', 'Bootstrap');
  logger.log(`📡 gRPC Server listening on port 50055`, 'Bootstrap');
  logger.log(`🔍 Health check available on port ${healthCheckPort}`, 'Bootstrap');

  await app.listen();

  logger.log('✅ Vendor Microservice successfully started', 'Bootstrap');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('🛑 Shutting down Vendor Microservice...', 'Bootstrap');
    await healthServer.stop();
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Vendor Microservice:', error);
  process.exit(1);
});
