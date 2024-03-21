import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_PACKAGE_NAME, AUTH_SERVICE_NAME } from '@sofa-web/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [
    ClientsModule.register([
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
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
