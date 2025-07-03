import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
// Временно отключаем мониторинг из-за ошибок метрик
// import { MicroserviceMonitoringModule, MetricsController } from '@sofa-web/common';

import { AuthModule } from './auth/auth.module';
// Временно отключаем модули с AuthGuard для тестирования HTTPS
// import { ProductModule } from './product/product.module';
// import { OrderModule } from './order/order.module';
// import { CartModule } from './cart/cart.module';
// import { VendorModule } from './vendor/vendor.module';
// import { PaymentModule } from './payment/payment.module';
// import { CategoryModule } from './category/category.module';
import { HealthModule } from './health/health.module';
import { TestModule } from './test/test.module';
import {
  SecurityHeadersMiddleware,
  RequestLoggingMiddleware,
  XssProtectionMiddleware
} from './auth/middleware';

@Module({
  imports: [
    // Временно отключаем мониторинг из-за ошибок метрик
    // MicroserviceMonitoringModule.forRoot({
    //   serviceName: 'api-gateway',
    //   port: 3000,
    // }),

    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Application modules
    HealthModule,
    TestModule,
    AuthModule,
    // Временно отключаем модули с AuthGuard для тестирования HTTPS
    // ProductModule,
    // OrderModule,
    // CartModule,
    // VendorModule,
    // PaymentModule,
    // CategoryModule
  ],
  controllers: [
    // Временно отключаем MetricsController
    // MetricsController
  ],
  providers: [
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityHeadersMiddleware, RequestLoggingMiddleware, XssProtectionMiddleware)
      .forRoutes('*');
  }
}
