import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CATEGORY_PACKAGE_NAME, CATEGORY_SERVICE_NAME } from '@sofa-web/common';
import { CategoryController } from './category.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CATEGORY_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50051',
          package: CATEGORY_PACKAGE_NAME,
          protoPath: 'proto/category.proto',
        },
      },
    ]),
  ],
  controllers: [CategoryController],
})
export class CategoryModule {}
