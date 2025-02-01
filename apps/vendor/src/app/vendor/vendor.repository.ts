import { Injectable } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { Vendor, Prisma } from '@prisma/client';

@Injectable()
export class VendorRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.VendorCreateInput): Promise<Vendor> {
    return this.prisma.vendor.create({ data });
  }

  async findUnique(
    where: Prisma.VendorWhereUniqueInput
  ): Promise<Vendor | null> {
    return this.prisma.vendor.findUnique({ where });
  }

  async update(
    where: Prisma.VendorWhereUniqueInput,
    data: Prisma.VendorUpdateInput
  ): Promise<Vendor> {
    return this.prisma.vendor.update({ where, data });
  }

  async delete(where: Prisma.VendorWhereUniqueInput): Promise<Vendor> {
    return this.prisma.vendor.delete({ where });
  }
}
