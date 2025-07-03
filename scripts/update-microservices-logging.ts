import { join } from 'path';
import { writeFileSync, readFileSync } from 'fs';

// Конфигурация микросервисов
const microservices = [
  { name: 'order', port: 50053, packages: ['order'] },
  { name: 'payment', port: 50054, packages: ['payment'] },
  { name: 'vendor', port: 50055, packages: ['vendor'] },
  { name: 'cart', port: 50056, packages: ['cart'] },
];

// Шаблон main.ts
const mainTemplate = (serviceName: string, port: number, packages: string[]) => `/**
 * ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Microservice with structured logging
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
        url: '0.0.0.0:${port}',
        package: ${packages.length === 1 ? `'${packages[0]}'` : JSON.stringify(packages)},
        protoPath: ${packages.length === 1
          ? `join(__dirname, '../../../proto/${packages[0]}.proto')`
          : `[${packages.map(p => `join(__dirname, '../../../proto/${p}.proto')`).join(', ')}]`
        },
      },
    }
  );

  // Используем Winston логгер
  const logger = await app.resolve(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  logger.log('🚀 ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Microservice starting...', 'Bootstrap');
  logger.log(\`📡 gRPC Server listening on port ${port}\`, 'Bootstrap');

  await app.listen();

  logger.log('✅ ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Microservice successfully started', 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Microservice:', error);
  process.exit(1);
});
`;

// Шаблон app.module.ts
const appModuleTemplate = (serviceName: string, port: number, imports: string[]) => `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MicroserviceLoggerModule } from '@sofa-web/common';
${imports.map(imp => `import { ${imp} } from './${imp.toLowerCase()}/${imp.toLowerCase()}.module';`).join('\n')}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MicroserviceLoggerModule.forRoot({
      serviceName: '${serviceName}',
      port: ${port},
    }),
${imports.map(imp => `    ${imp},`).join('\n')}
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
`;

console.log('🚀 Обновление микросервисов с логированием...\n');

microservices.forEach(service => {
  console.log(`📝 Обновляю ${service.name}...`);

  try {
    // Определяем импорты для модулей
    let imports: string[] = [];

    // Для каждого сервиса определяем какие модули должны быть импортированы
    switch (service.name) {
      case 'order':
        imports = ['OrderModule'];
        break;
      case 'payment':
        imports = ['PaymentModule'];
        break;
      case 'vendor':
        imports = ['VendorModule'];
        break;
      case 'cart':
        imports = ['CartModule'];
        break;
    }

    // Пути к файлам
    const mainPath = join(process.cwd(), `apps/${service.name}/src/main.ts`);
    const appModulePath = join(process.cwd(), `apps/${service.name}/src/app/app.module.ts`);

    // Создаём резервные копии
    try {
      const mainBackup = readFileSync(mainPath, 'utf8');
      writeFileSync(`${mainPath}.backup`, mainBackup);
    } catch {}

    try {
      const appModuleBackup = readFileSync(appModulePath, 'utf8');
      writeFileSync(`${appModulePath}.backup`, appModuleBackup);
    } catch {}

    // Записываем новые файлы
    writeFileSync(mainPath, mainTemplate(service.name, service.port, service.packages));
    writeFileSync(appModulePath, appModuleTemplate(service.name, service.port, imports));

    console.log(`✅ ${service.name} обновлен успешно`);
  } catch (error) {
    console.error(`❌ Ошибка при обновлении ${service.name}:`, error.message);
  }
});

console.log('\n🎉 Все микросервисы обновлены!');
console.log('📝 Создайте резервные копии и проверьте каждый сервис');
console.log('🔧 Не забудьте добавить логирование в контроллеры и сервисы');
