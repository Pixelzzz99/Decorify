import { Injectable } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User, Role } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async createUser(
    data: CreateUserDto,
    role: Role = Role.CUSTOMER
  ): Promise<User> {
    return this.prisma.user.create({
      data: { ...data, role },
    });
  }

  async getUserById(id: number): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUserById(id: number, data: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
