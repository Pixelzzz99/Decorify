import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import {
  AUTH_SERVICE_NAME,
  PRODUCT_SERVICE_NAME,
  ORDER_SERVICE_NAME,
  PAYMENT_SERVICE_NAME,
  VENDOR_SERVICE_NAME,
  CART_SERVICE_NAME,
  CATEGORY_SERVICE_NAME
} from '@sofa-web/common';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: process.env.AUTH_SERVICE_URL || 'localhost:50051',
          package: 'auth',
          protoPath: 'proto/auth.proto',
        },
      },
      {
        name: PRODUCT_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: process.env.PRODUCT_SERVICE_URL || 'localhost:50052',
          package: 'product',
          protoPath: 'proto/product.proto',
        },
      },
      {
        name: ORDER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: process.env.ORDER_SERVICE_URL || 'localhost:50053',
          package: 'order',
          protoPath: 'proto/order.proto',
        },
      },
      {
        name: PAYMENT_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: process.env.PAYMENT_SERVICE_URL || 'localhost:50054',
          package: 'payment',
          protoPath: 'proto/payment.proto',
        },
      },
      {
        name: VENDOR_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: process.env.VENDOR_SERVICE_URL || 'localhost:50055',
          package: 'vendor',
          protoPath: 'proto/vendor.proto',
        },
      },
      {
        name: CART_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: process.env.CART_SERVICE_URL || 'localhost:50056',
          package: 'cart',
          protoPath: 'proto/cart.proto',
        },
      },
      {
        name: CATEGORY_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: process.env.CATEGORY_SERVICE_URL || 'localhost:50057',
          package: 'category',
          protoPath: 'proto/category.proto',
        },
      },
    ]),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
