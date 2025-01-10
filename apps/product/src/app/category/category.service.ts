import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getCategories(): Promise<Category[]> {
    return await this.prisma.category.findMany();
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async createCategory(name: string): Promise<Category> {
    return await this.prisma.category.create({
      data: {
        categoryName: name,
      },
    });
  }

  async updateCategory(id: number, name: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return await this.prisma.category.update({
      where: { id },
      data: {
        categoryName: name,
      },
    });
  }

  async deleteCategory(id: number): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return await this.prisma.category.delete({
      where: { id },
    });
  }
}
