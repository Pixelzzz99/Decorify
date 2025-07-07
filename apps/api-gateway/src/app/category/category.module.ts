import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  CATEGORY_PACKAGE_NAME,
  CATEGORY_SERVICE_NAME,
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME
} from '@sofa-web/common';
import { CategoryController } from './category.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CATEGORY_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50053',
          package: CATEGORY_PACKAGE_NAME,
          protoPath: 'proto/category.proto',
        },
      },
      {
        name: AUTH_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50051',
          package: AUTH_PACKAGE_NAME,
          protoPath: './proto/auth.proto',
        },
      },
    ]),
  ],
  controllers: [CategoryController],
})
export class CategoryModule {}
