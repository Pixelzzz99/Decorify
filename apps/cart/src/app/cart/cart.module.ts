import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { RedisService } from './redis.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50053',
          package: 'product',
          protoPath: './proto/product.proto',
        },
      },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService, RedisService],
})
export class CartModule {}
