import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async createVendor(dto: CreateVendorDto) {
    const vendor = await this.prisma.vendor.create({
      data: {
        userId: dto.userId,
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
      },
    });

    return vendor;
  }

  async getVendorById(vendorId: number) {
    const vendor = await this.prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  async updateVendor(vendorId: number, dto: Partial<CreateVendorDto>) {
    const vendor = await this.prisma.vendor.update({
      where: { id: vendorId },
      data: dto,
    });
    return vendor;
  }

  async deleteVendor(vendorId: number) {
    await this.prisma.vendor.delete({
      where: { id: vendorId },
    });
    return { message: 'Vendor deleted successfully' };
  }
}
