import { Module } from '@nestjs/common';
import { PrismaModule } from '@sofa-web/prisma';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
