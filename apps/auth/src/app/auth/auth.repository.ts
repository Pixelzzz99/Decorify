import { Injectable } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findUserById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async createUser(data: Omit<Prisma.UserCreateInput, 'role'>) {
    return this.prisma.user.create({
      data: {
        ...data,
        role: Role.CUSTOMER,
      },
    });
  }
}
