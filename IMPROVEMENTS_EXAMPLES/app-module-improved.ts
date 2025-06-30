import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { VendorModule } from './vendor/vendor.module';
import { PaymentModule } from './payment/payment.module';
import { CategoryModule } from './category/category.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100
      }
    ]),

    // Health checks
    TerminusModule,
    HealthModule,

    // Business modules
    AuthModule,
    ProductModule,
    OrderModule,
    CartModule,
    VendorModule,
    PaymentModule,
    CategoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
