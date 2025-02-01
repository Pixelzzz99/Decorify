import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { PrismaModule } from '@sofa-web/prisma';
import { VendorController } from './vendor.controller';
@Module({
  imports: [PrismaModule],
  controllers: [VendorController],
  providers: [VendorService],
})
export class VendorModule {}
