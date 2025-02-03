import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InventoryClient } from '../inventory/inventory.client';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

interface ProductFull extends Product {
  categories: { productId: number; categoryId: number }[];
  images: { imageUrl: string }[];
}

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private inventoryClient: InventoryClient
  ) {}

  async getProducts(skip = 0, take = 10): Promise<ProductFull[]> {
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

  async getProduct(id: number): Promise<ProductFull> {
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

  async createProduct(
    createProductDto: CreateProductDto
  ): Promise<ProductFull> {
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

    //Check if categories exist
    try {
      const product = await this.prisma.product.create({
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
          categories: {
            include: {
              category: true,
            },
          },
          images: true,
        },
      });

      // Sync with inventory service
      await this.inventoryClient.syncWithProduct(product.id);

      return product;
    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to create product',
      });
    }
  }

  async updateProduct(
    productId: number,
    updateProductDto: UpdateProductDto
  ): Promise<ProductFull> {
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

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: true,
        images: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const categories = categoryIds
      .filter((id) => !product.categories.some((c) => c.categoryId === id))
      .map((id) => ({ categoryId: id }));

    const images = imageUrls
      .filter((url) => !product.images.some((i) => i.imageUrl === url))
      .map((url) => ({ imageUrl: url }));

    const updatedProduct = await this.prisma.product.update({
      where: { id: productId },
      data: {
        productName,
        description,
        price,
        stockQuantity,
        dimensions,
        weight,
        categories: {
          createMany: {
            data: categories,
          },
        },
        images: {
          createMany: {
            data: images,
          },
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        images: true,
      },
    });

    // Sync with inventory service
    await this.inventoryClient.updateStock(productId, stockQuantity);

    return updatedProduct;
  }

  async deleteProduct(productId: number): Promise<ProductFull> {
    try {
      const deleteOperations = [
        this.prisma.productCategory.deleteMany({
          where: { productId },
        }),
        this.prisma.productImage.deleteMany({
          where: { productId },
        }),
      ];

      await this.prisma.$transaction(deleteOperations);

      return await this.prisma.product.delete({
        where: { id: productId },
        include: {
          categories: true,
          images: true,
        },
      });
    } catch (error) {
      console.log(error.message);
      throw new NotFoundException('Product not found');
    }
  }

  async getProductById(productId: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new RpcException({
          status: status.NOT_FOUND,
          message: 'Product not found',
        });
      }

      // Get inventory data
      const inventory = await this.inventoryClient.getProductStock(productId);

      return {
        ...product,
        inventory: inventory.data,
      };
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to get product',
      });
    }
  }
}
