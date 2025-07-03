#!/bin/bash

# Скрипт для внедрения структурированного логирования во все микросервисы

SERVICES=("product" "order" "payment" "vendor" "cart")
PORTS=(50052 50053 50054 50055 50056)

echo "🚀 Внедрение структурированного логирования в микросервисы..."

for i in "${!SERVICES[@]}"; do
  SERVICE=${SERVICES[$i]}
  PORT=${PORTS[$i]}

  echo "📝 Обновляю $SERVICE (порт $PORT)..."

  # Создаем резервную копию main.ts
  cp "apps/$SERVICE/src/main.ts" "apps/$SERVICE/src/main.ts.backup" 2>/dev/null || true

  # Обновляем main.ts
  cat > "apps/$SERVICE/src/main.ts" << EOF
/**
 * $SERVICE Microservice with structured logging
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
        url: '0.0.0.0:$PORT',
        package: '$SERVICE',
        protoPath: join(__dirname, '../../../proto/$SERVICE.proto'),
      },
    }
  );

  // Используем Winston логгер
  const logger = await app.resolve(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  logger.log('🚀 $SERVICE Microservice starting...', 'Bootstrap');
  logger.log(\`📡 gRPC Server listening on port $PORT\`, 'Bootstrap');

  await app.listen();

  logger.log('✅ $SERVICE Microservice successfully started', 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start $SERVICE Microservice:', error);
  process.exit(1);
});
EOF

  # Создаем резервную копию app.module.ts
  cp "apps/$SERVICE/src/app/app.module.ts" "apps/$SERVICE/src/app/app.module.ts.backup" 2>/dev/null || true

  echo "✅ $SERVICE обновлен"
done

echo "🎉 Все микросервисы обновлены с логированием!"
echo "📚 Не забудьте обновить контроллеры и сервисы в каждом микросервисе"
