import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MicroserviceLoggerModule } from '@sofa-web/common';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MicroserviceLoggerModule.forRoot({
      serviceName: 'auth',
      port: 50051,
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
