import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  PRODUCT_PACKAGE_NAME,
  PRODUCT_SERVICE_NAME,
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME
} from '@sofa-web/common';
import { ProductController } from './product.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PRODUCT_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50052',
          package: PRODUCT_PACKAGE_NAME,
          protoPath: './proto/product.proto',
        },
      },
      {
        name: AUTH_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50051',
          package: AUTH_PACKAGE_NAME,
          protoPath: './proto/auth.proto',
        },
      }
    ])
  ],
  controllers: [ProductController],
})
export class ProductModule {}
