import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '@sofa-web/prisma';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'CART_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'cart',
          protoPath: './proto/cart.proto',
          url: '0.0.0.0:50051',
        },
      },
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'payment',
          protoPath: './proto/payment.proto',
          url: '0.0.0.0:50053',
        },
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
