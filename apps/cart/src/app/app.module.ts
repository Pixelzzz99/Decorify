import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MicroserviceLoggerModule } from '@sofa-web/common';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MicroserviceLoggerModule.forRoot({
      serviceName: 'cart',
      port: 50056,
    }),
    CartModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
