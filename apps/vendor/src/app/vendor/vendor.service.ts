import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async createVendor(dto: CreateVendorDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user || user.role !== 'VENDOR') {
      throw new NotFoundException('User with role VENDOR not found');
    }
    const vendor = await this.prisma.vendor.create({
      data: {
        userId: dto.userId,
        storeName: dto.storeName,
        storeDescription: dto.storeDescription,
      },
    });

    return vendor;
  }

  async getVendorById(userId: number) {
    const vendor = await this.prisma.vendor.findUnique({
      where: {
        userId,
      },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  async updateVendor(userId: number, dto: Partial<CreateVendorDto>) {
    const vendor = await this.prisma.vendor.update({
      where: { userId },
      data: dto,
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  async deleteVendor(userId: number) {
    await this.prisma.vendor.delete({
      where: { userId },
    });
    return { message: 'Vendor deleted successfully' };
  }
}
