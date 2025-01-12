import { Module } from '@nestjs/common';
import { PrismaModule } from '@sofa-web/prisma';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'PRODUCT_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50053',
          package: 'product',
          protoPath: 'proto/product.proto',
        },
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
