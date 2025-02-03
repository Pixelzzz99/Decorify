import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { RedisService } from './redis.service';
import { PrismaModule } from '@sofa-web/prisma';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService, RedisService],
  exports: [CartService],
})
export class CartModule {}
