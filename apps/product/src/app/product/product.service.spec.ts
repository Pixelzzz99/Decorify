import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '@sofa-web/prisma';
import { ConfigModule } from '@nestjs/config';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';

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

    await prisma.productCategory.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
  });

  afterAll(async () => {
    await prisma.productCategory.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();

    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product and return it', async () => {
      const newProduct: CreateProductDto = {
        productName: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        stockQuantity: 5,
        weight: 0.5,
        vendorId: 1,
        categoryIds: [1],
        imageUrls: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      };

      const product = await service.createProduct(newProduct);

      expect(product).toBeDefined();
      expect(product.productName).toEqual(newProduct.productName);
      //   expect(product.images.length).toBe(2);
      //   expect(product.images[0].imageUrl).toEqual(
      // 'https://example.com/image1.jpg'
      //   );
    });
  });
});
