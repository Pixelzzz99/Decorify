import { Module } from '@nestjs/common';
import { PrismaModule } from '@sofa-web/prisma';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
// import { InventoryClient } from '../inventory/inventory.client'; // Disabled for Railway deployment

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService], // InventoryClient removed temporarily
  exports: [ProductService],
})
export class ProductModule {}
