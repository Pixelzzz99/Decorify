import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ORDER_SERVICE_NAME, ORDER_PACKAGE_NAME } from '@sofa-web/common';
import { OrderController } from './order.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ORDER_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50052',
          package: ORDER_PACKAGE_NAME,
          protoPath: './proto/order.proto',
        },
      },
    ]),
  ],
  controllers: [OrderController],
})
export class OrderModule {}
