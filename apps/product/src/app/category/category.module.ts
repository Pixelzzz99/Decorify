import { Module } from '@nestjs/common';
import { PrismaModule } from '@sofa-web/prisma';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'CATEGORY_SERVICE',
        transport: Transport.GRPC,
        options: {
          url: '0.0.0.0:50054',
          package: 'category',
          protoPath: './proto/category.proto',
        },
      },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
