import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CART_PACKAGE_NAME, CART_SERVICE_NAME } from '@sofa-web/common';
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
    ]),
  ],
  controllers: [CartController],
})
export class CartModule {}
