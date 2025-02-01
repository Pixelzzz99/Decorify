import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async getCategories(): Promise<{ categories: Category[] }> {
    return {
      categories: await this.prisma.category.findMany(),
    };
  }

  async getCategoryById(id: number): Promise<{ category: Category }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return { category };
  }

  async createCategory(name: string): Promise<{ category: Category }> {
    const category = await this.prisma.category.create({
      data: {
        categoryName: name,
      },
    });
    return { category };
  }

  async updateCategory(
    id: number,
    name: string
  ): Promise<{ category: Category }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        categoryName: name,
      },
    });
    return { category: updatedCategory };
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    await this.prisma.category.delete({
      where: { id },
    });
    return { message: 'Category deleted successfully' };
  }
}
