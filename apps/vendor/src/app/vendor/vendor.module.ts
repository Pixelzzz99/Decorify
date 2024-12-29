import { Module } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { PrismaModule } from '@sofa-web/prisma';

@Module({
  imports: [PrismaModule],
  providers: [VendorService],
})
export class VendorModule {}
