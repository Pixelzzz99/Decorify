import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MicroserviceLoggerModule } from '@sofa-web/common';
import { VendorModule } from './vendor/vendor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MicroserviceLoggerModule.forRoot({
      serviceName: 'vendor',
      port: 50055,
    }),
    VendorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
