import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PRODUCT_PACKAGE_NAME, PRODUCT_SERVICE_NAME } from '@sofa-web/common';
import { ProductController } from './product.controller';

@Module({
  imports: [ClientsModule.register([
    {
      name: PRODUCT_SERVICE_NAME,
      transport: Transport.GRPC,
      options: {
        url: 'localhost:50053',
        package: PRODUCT_PACKAGE_NAME,
        protoPath: './proto/product.proto',
      },
    }
  ])],
  controllers: [ProductController],
})
export class ProductModule {}
