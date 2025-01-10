import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '@sofa-web/prisma';
import { ConfigModule } from '@nestjs/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('ProductService (with test database)', () => {
  let service: ProductService;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: '.env.test' })],
      providers: [ProductService, PrismaService],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.productImage.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.product.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    await prisma.productImage.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.product.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.productImage.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.product.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product and return it', async () => {
      //Create user
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
          role: 'VENDOR',
        },
      });

      //Create vendor
      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          storeName: 'Test Store',
          storeDescription: 'Description for Test Store',
        },
      });

      //Create category
      const category = await prisma.category.create({
        data: {
          categoryName: 'Chairs',
        },
      });

      const newProduct: CreateProductDto = {
        productName: 'Chair Model Chainese 1A',
        description: 'Description for Chair Model Chainese 1A',
        price: 1500.99,
        stockQuantity: 5,
        weight: 0.5,
        vendorId: vendor.id,
        categoryIds: [category.id],
        imageUrls: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      };

      const product = await service.createProduct(newProduct);
      //   console.dir(product, { depth: 10 });

      expect(product).toBeDefined();
      expect(product.productName).toEqual('Chair Model Chainese 1A');
      expect(product.categories).toHaveLength(1);
      expect(product.categories[0].categoryId).toBe(category.id);
      expect(product.images).toHaveLength(2);
      expect(product.images[0].imageUrl).toBe('https://example.com/image1.jpg');
    });
  });

  describe('getProducts', () => {
    it('should return an list of products', async () => {
      //Create user
      const user = await prisma.user.create({
        data: {
          username: 'sofaVendor',
          email: 'sofaVendor@example.com',
          password: 'password',
          role: 'VENDOR',
        },
      });

      //Create vendor
      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          storeName: 'Sofa Store',
          storeDescription: 'Description for Sofa Store',
        },
      });

      await prisma.product.createMany({
        data: [
          {
            productName: 'Sofa Model 1',
            description: 'Description for Sofa Model 1',
            price: 1500.99,
            stockQuantity: 5,
            weight: 0.5,
            vendorId: vendor.id,
          },
          {
            productName: 'Sofa Model 2',
            description: 'Description for Sofa Model 2',
            price: 1500.99,
            stockQuantity: 5,
            weight: 0.5,
            vendorId: vendor.id,
          },
        ],
      });

      const products = await service.getProducts();
      expect(products).toBeDefined();
      expect(products).toHaveLength(2);
      expect(products[0].productName).toBe('Sofa Model 1');
      expect(products[1].productName).toBe('Sofa Model 2');
    });
  });

  describe('getProductById', () => {
    it('should return a product by id', async () => {
      const category = await prisma.category.create({
        data: {
          categoryName: 'Decor Sofa',
        },
      });
      //Create user
      const user = await prisma.user.create({
        data: {
          username: 'sofaVendor',
          email: 'sofaVendor@example.com',
          password: 'password',
          role: 'VENDOR',
        },
      });

      //Create vendor
      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          storeName: 'Sofa Store',
          storeDescription: 'Description for Sofa Store',
        },
      });

      const product = await prisma.product.create({
        data: {
          productName: 'Sofa Model 1',
          description: 'Description for Sofa Model 1',
          price: 1500.99,
          stockQuantity: 5,
          weight: 0.5,
          vendorId: vendor.id,
          categories: {
            create: {
              categoryId: category.id,
            },
          },
        },
        include: {
          categories: true,
        },
      });

      const productById = await service.getProduct(product.id);
      expect(productById).toBeDefined();
      expect(productById.productName).toBe('Sofa Model 1');
      expect(productById.categories).toHaveLength(1);
      expect(productById.categories[0].categoryId).toBe(category.id);
    });

    it('should throw an error if product not found', async () => {
      await expect(service.getProduct(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProduct', () => {
    it('should update a product and return it', async () => {
      //Create category
      const category = await prisma.category.create({
        data: {
          categoryName: 'Decor Sofa',
        },
      });
      //Create user
      const user = await prisma.user.create({
        data: {
          username: 'sofaVendor',
          email: 'sofaVendor@example.com',
          password: 'password',
          role: 'VENDOR',
        },
      });

      //Create vendor
      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          storeName: 'Sofa Store',
          storeDescription: 'Description for Sofa Store',
        },
      });

      const product = await prisma.product.create({
        data: {
          productName: 'Sofa Model 1',
          description: 'Description for Sofa Model 1',
          price: 1500.99,
          stockQuantity: 5,
          weight: 0.5,
          vendorId: vendor.id,
          categories: {
            create: {
              categoryId: category.id,
            },
          },
        },
        include: {
          categories: true,
        },
      });

      const updatedProduct = await service.updateProduct(product.id, {
        productName: 'Sofa Model 1 Updated',
        description: 'Description for Sofa Model 1 Updated',
        price: 2500.99,
        stockQuantity: 15,
        weight: 0.6,
        categoryIds: [category.id],
        imageUrls: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      });
      expect(updatedProduct).toBeDefined();
      expect(updatedProduct.productName).toBe('Sofa Model 1 Updated');
      expect(updatedProduct.price).toBe(2500.99);
      expect(updatedProduct.stockQuantity).toBe(15);
      expect(updatedProduct.weight).toBe(0.6);
      expect(updatedProduct.categories).toHaveLength(1);
      expect(updatedProduct.categories[0].categoryId).toBe(category.id);
      expect(updatedProduct.images).toHaveLength(2);
      expect(updatedProduct.images[0].imageUrl).toBe(
        'https://example.com/image1.jpg'
      );
      expect(updatedProduct.images[1].imageUrl).toBe(
        'https://example.com/image2.jpg'
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and return it', async () => {
      //Create category
      const category = await prisma.category.create({
        data: {
          categoryName: 'Decor Sofa',
        },
      });
      //Create user
      const user = await prisma.user.create({
        data: {
          username: 'sofaVendor',
          email: 'sofaVendor@example.com',
          password: 'password',
          role: 'VENDOR',
        },
      });

      //Create vendor
      const vendor = await prisma.vendor.create({
        data: {
          userId: user.id,
          storeName: 'Sofa Store',
          storeDescription: 'Description for Sofa Store',
        },
      });

      const product = await prisma.product.create({
        data: {
          productName: 'Sofa Model 1',
          description: 'Description for Sofa Model 1',
          price: 1500.99,
          stockQuantity: 5,
          weight: 0.5,
          vendorId: vendor.id,
          categories: {
            create: {
              categoryId: category.id,
            },
          },
        },
        include: {
          categories: true,
        },
      });

      const deletedProduct = await service.deleteProduct(product.id);
      expect(deletedProduct).toBeDefined();
      expect(deletedProduct.productName).toBe('Sofa Model 1');
      expect(deletedProduct.categories).toHaveLength(1);
      expect(deletedProduct.categories[0].categoryId).toBe(category.id);

      const result = await prisma.product.findUnique({
        where: { id: product.id },
      });

      expect(result).toBeNull();
    });
  });
});
