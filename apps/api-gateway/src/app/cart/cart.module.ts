import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  CART_PACKAGE_NAME,
  CART_SERVICE_NAME,
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME
} from '@sofa-web/common';
import { CartController } from './cart.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CART_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50056',
          package: CART_PACKAGE_NAME,
          protoPath: './proto/cart.proto',
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
      },
    ]),
  ],
  controllers: [CartController],
})
export class CartModule {}
