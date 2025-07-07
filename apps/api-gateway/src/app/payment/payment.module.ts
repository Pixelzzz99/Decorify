import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  PAYMENT_PACKAGE_NAME,
  PAYMENT_SERVICE_NAME,
  AUTH_PACKAGE_NAME,
  AUTH_SERVICE_NAME
} from '@sofa-web/common';
import { PaymentController } from './payment.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: PAYMENT_SERVICE_NAME,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:50054',
          package: PAYMENT_PACKAGE_NAME,
          protoPath: './proto/payment.proto',
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
  controllers: [PaymentController],
})
export class PaymentModule {}
