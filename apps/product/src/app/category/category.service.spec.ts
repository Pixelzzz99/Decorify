import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '@sofa-web/prisma';
import { NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { ConfigModule } from '@nestjs/config';

describe('CategoryService', () => {
  let service: CategoryService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: '.env.test' })],
      providers: [CategoryService, PrismaService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.category.deleteMany();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return an list of categories', async () => {
      await prisma.category.createMany({
        data: [
          {
            categoryName: 'Category 1',
          },
          {
            categoryName: 'Category 2',
          },
        ],
      });

      const categories = await service.getCategories();

      expect(categories).toHaveLength(2);
      expect(categories[0].categoryName).toBe('Category 1');
      expect(categories[1].categoryName).toBe('Category 2');
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by id', async () => {
      const category = await prisma.category.create({
        data: {
          categoryName: 'Category 1',
        },
      });

      const categoryById = await service.getCategoryById(category.id);

      expect(categoryById).toEqual(category);
      expect(categoryById.categoryName).toBe('Category 1');
    });

    it('should throw NotFoundException if category does not exist', async () => {
      await expect(service.getCategoryById(999)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('createCategory', () => {
    it('should create a new category and return it', async () => {
      const result = await service.createCategory('New Category');
      expect(result).toBeDefined();
      expect(result.categoryName).toBe('New Category');

      const createdCategory = await prisma.category.findUnique({
        where: { id: result.id },
      });
      expect(createdCategory).toBeDefined();
      expect(createdCategory?.categoryName).toBe('New Category');
    });
  });

  describe('updateCategory', () => {
    it('should update a category and return it', async () => {
      const category = await prisma.category.create({
        data: {
          categoryName: 'Old Name',
        },
      });

      const result = await service.updateCategory(category.id, 'New Name');

      expect(result).toBeDefined();
      expect(result.categoryName).toBe('New Name');

      const updatedCategory = await prisma.category.findUnique({
        where: { id: category.id },
      });

      expect(updatedCategory).toBeDefined();
      expect(updatedCategory?.categoryName).toBe('New Name');
    });

    it('should throw NotFoundException if category does not exist', async () => {
      await expect(service.updateCategory(999, 'New Name')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category and return it', async () => {
      const category = await prisma.category.create({
        data: {
          categoryName: 'To Delete',
        },
      });

      const result = await service.deleteCategory(category.id);

      expect(result).toBeDefined();
      expect(result.categoryName).toBe('To Delete');

      const deletedCategory = await prisma.category.findUnique({
        where: { id: category.id },
      });

      expect(deletedCategory).toBeNull();
    });

    it('should throw NotFoundException if category does not exist', async () => {
      await expect(service.deleteCategory(999)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
