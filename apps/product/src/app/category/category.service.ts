import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { Category } from '@prisma/client';

interface CategoryWithChildren extends Category {
  subCategories?: CategoryWithChildren[];
  products?: {
    product: {
      id: number;
      productName: string;
      price: number;
      images: { imageUrl: string }[];
      Vendor: { id: number; storeName: string };
    };
  }[];
  parentCategory?: Category;
  _count?: {
    products: number;
    subCategories: number;
  };
}

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // Получить все категории плоским списком
  async getCategories(): Promise<{ categories: Category[] }> {
    return {
      categories: await this.prisma.category.findMany({
        include: {
          _count: {
            select: {
              products: true,
              subCategories: true
            }
          }
        },
        orderBy: { categoryName: 'asc' }
      }),
    };
  }

  // Получить категории в виде дерева (только корневые с детьми)
  async getCategoryTree(): Promise<{ categories: CategoryWithChildren[] }> {
    const rootCategories = await this.prisma.category.findMany({
      where: { parentCategoryId: null },
      include: {
        subCategories: {
          include: {
            subCategories: {
              include: {
                _count: {
                  select: { products: true }
                }
              }
            },
            _count: {
              select: { products: true, subCategories: true }
            }
          }
        },
        _count: {
          select: { products: true, subCategories: true }
        }
      },
      orderBy: { categoryName: 'asc' }
    });

    return { categories: rootCategories };
  }

  // Получить категорию с подкатегориями и товарами
  async getCategoryById(id: number, includeProducts = false): Promise<{ category: any }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: {
          include: {
            _count: {
              select: { products: true, subCategories: true }
            }
          }
        },
        parentCategory: true,
        products: includeProducts ? {
          include: {
            product: {
              include: {
                images: true,
                Vendor: {
                  select: {
                    id: true,
                    storeName: true
                  }
                }
              }
            }
          }
        } : false,
        _count: {
          select: {
            products: true,
            subCategories: true
          }
        }
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return { category };
  }

  // Получить товары по категории (включая подкатегории)
  async getProductsByCategory(
    categoryId: number,
    includeSubcategories = true,
    skip = 0,
    take = 10
  ) {
    let categoryIds = [categoryId];

    if (includeSubcategories) {
      // Получаем все ID подкатегорий рекурсивно
      categoryIds = await this.getAllSubcategoryIds(categoryId);
    }

    const products = await this.prisma.product.findMany({
      where: {
        categories: {
          some: {
            categoryId: {
              in: categoryIds
            }
          }
        }
      },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        images: true,
        Vendor: {
          select: {
            id: true,
            storeName: true
          }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    const total = await this.prisma.product.count({
      where: {
        categories: {
          some: {
            categoryId: {
              in: categoryIds
            }
          }
        }
      }
    });

    return { products, total, categoryIds };
  }

  // Создать категорию (с поддержкой родительской категории)
  async createCategory(
    name: string,
    parentCategoryId?: number
  ): Promise<{ category: Category }> {
    // Проверяем существование родительской категории
    if (parentCategoryId) {
      const parentExists = await this.prisma.category.findUnique({
        where: { id: parentCategoryId }
      });
      if (!parentExists) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = await this.prisma.category.create({
      data: {
        categoryName: name,
        parentCategoryId
      },
      include: {
        parentCategory: true,
        _count: {
          select: { products: true, subCategories: true }
        }
      }
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

  // Рекурсивно получить все ID подкатегорий
  private async getAllSubcategoryIds(categoryId: number): Promise<number[]> {
    const allIds = [categoryId];

    const children = await this.prisma.category.findMany({
      where: { parentCategoryId: categoryId },
      select: { id: true }
    });

    for (const child of children) {
      const childIds = await this.getAllSubcategoryIds(child.id);
      allIds.push(...childIds);
    }

    return allIds;
  }

  // Получить breadcrumbs для категории
  async getCategoryBreadcrumbs(categoryId: number): Promise<{ breadcrumbs: Category[] }> {
    const breadcrumbs: Category[] = [];
    let currentId = categoryId;

    while (currentId) {
      const category = await this.prisma.category.findUnique({
        where: { id: currentId }
      });

      if (!category) break;

      breadcrumbs.unshift(category);
      currentId = category.parentCategoryId;
    }

    return { breadcrumbs };
  }

  // Проверить можно ли удалить категорию
  async canDeleteCategory(id: number): Promise<{ canDelete: boolean, reason?: string }> {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            subCategories: true
          }
        }
      }
    });

    if (!category) {
      return { canDelete: false, reason: 'Category not found' };
    }

    if (category._count.products > 0) {
      return { canDelete: false, reason: `Category has ${category._count.products} products` };
    }

    if (category._count.subCategories > 0) {
      return { canDelete: false, reason: `Category has ${category._count.subCategories} subcategories` };
    }

    return { canDelete: true };
  }
}
