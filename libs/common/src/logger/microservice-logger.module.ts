import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { MicroserviceLoggerConfig, createMicroserviceLoggerConfig } from './microservice-winston.config';

@Global()
@Module({})
export class MicroserviceLoggerModule {
  static forRoot(config: MicroserviceLoggerConfig) {
    return {
      module: MicroserviceLoggerModule,
      imports: [
        WinstonModule.forRoot(createMicroserviceLoggerConfig(config)),
      ],
      exports: [WinstonModule],
    };
  }
}
