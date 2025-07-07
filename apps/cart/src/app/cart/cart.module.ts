import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { RedisService } from './redis.service';
import { PrismaModule } from '@sofa-web/prisma';
import { PRODUCT_PACKAGE_NAME, PRODUCT_SERVICE_NAME } from '@sofa-web/common';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: PRODUCT_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: process.env.PRODUCT_SERVICE_URL || 'localhost:50052',
          package: PRODUCT_PACKAGE_NAME,
          protoPath: './proto/product.proto',
        },
      },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService, RedisService],
  exports: [CartService],
})
export class CartModule {}
