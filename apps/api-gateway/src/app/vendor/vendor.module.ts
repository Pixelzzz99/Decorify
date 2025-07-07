import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  VENDOR_PACKAGE_NAME,
  VENDOR_SERVICE_NAME,
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME
} from '@sofa-web/common';
import { VendorController } from './vendor.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: VENDOR_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50055',
          package: VENDOR_PACKAGE_NAME,
          protoPath: './proto/vendor.proto',
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
  controllers: [VendorController],
})
export class VendorModule {}
