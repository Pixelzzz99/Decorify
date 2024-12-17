import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async getProducts(skip = 0, take = 10): Promise<Product[]> {
    return await this.prisma.product.findMany({
      skip,
      take,
      include: {
        categories: { include: { category: true } },
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProduct(id: number): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async createProduct(createProductDto: CreateProductDto): Promise<Product> {
    const {
      productName,
      description,
      price,
      stockQuantity,
      dimensions,
      weight,
      vendorId,
      categoryIds,
      imageUrls,
    } = createProductDto;

    try {
      return await this.prisma.product.create({
        data: {
          productName,
          description,
          price,
          stockQuantity,
          dimensions,
          weight,
          vendorId,
          categories: {
            create: categoryIds.map((id) => ({ categoryId: id })),
          },
          images: {
            createMany: {
              data: imageUrls.map((url) => ({ imageUrl: url })),
            },
          },
        },
        include: {
          categories: true,
          images: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async updateProduct(
    productId: number,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    const {
      productName,
      description,
      price,
      stockQuantity,
      dimensions,
      weight,
      categoryIds,
      imageUrls,
    } = updateProductDto;

    try {
      await this.prisma.$transaction(async (tx) => {
        tx.productCategory.deleteMany({
          where: {
            productId,
          },
        });
        tx.productImage.deleteMany({
          where: {
            productId,
          },
        });
      });

      return await this.prisma.product.update({
        where: { id: productId },
        data: {
          productName,
          description,
          price,
          stockQuantity,
          dimensions,
          weight,
          categories: {
            create: categoryIds.map((id) => ({ categoryId: id })),
          },
          images: {
            createMany: {
              data: imageUrls.map((url) => ({ imageUrl: url })),
            },
          },
        },
        include: {
          categories: true,
          images: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async deleteProduct(productId: number): Promise<Product> {
    try {
      return await this.prisma.product.delete({
        where: { id: productId },
        include: {
          categories: true,
          images: true,
        },
      });
    } catch (error) {
      throw new NotFoundException('Product not found');
    }
  }
}
