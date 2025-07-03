import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MicroserviceLoggerModule } from '@sofa-web/common';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MicroserviceLoggerModule.forRoot({
      serviceName: 'order',
      port: 50053,
    }),
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
