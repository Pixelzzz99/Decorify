import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { VendorModule } from './vendor/vendor.module';
import { PaymentModule } from './payment/payment.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    AuthModule,
    ProductModule,
    OrderModule,
    CartModule,
    VendorModule,
    PaymentModule,
    CategoryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
