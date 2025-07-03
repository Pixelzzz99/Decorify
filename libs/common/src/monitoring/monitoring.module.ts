import { Module, Global } from '@nestjs/common';
import { MetricsService, MicroserviceMetricsConfig } from './metrics.service';

@Global()
@Module({})
export class MicroserviceMonitoringModule {
  static forRoot(config: MicroserviceMetricsConfig) {
    return {
      module: MicroserviceMonitoringModule,
      providers: [
        {
          provide: MetricsService,
          useFactory: () => new MetricsService(config),
        },
      ],
      exports: [MetricsService],
    };
  }
}
