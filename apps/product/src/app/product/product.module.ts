import { Module } from '@nestjs/common';
import { PrismaModule } from '@sofa-web/prisma';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { InventoryClient } from '../inventory/inventory.client';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService, InventoryClient],
  exports: [ProductService],
})
export class ProductModule {}
