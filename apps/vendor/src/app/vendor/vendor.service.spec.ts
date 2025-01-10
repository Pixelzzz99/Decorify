import { Test, TestingModule } from '@nestjs/testing';
import { VendorService } from './vendor.service';
import { PrismaService } from '@sofa-web/prisma';

describe('VendorService', () => {
  let service: VendorService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorService, PrismaService],
    }).compile();

    service = module.get<VendorService>(VendorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVendor', () => {
    it('should create a new vendor', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
          role: 'VENDOR',
        },
      });

      const vendor = await service.createVendor({
        userId: user.id,
        storeName: 'Test Store',
        storeDescription: 'Description for Test Store',
      });

      expect(vendor).toBeDefined();
      expect(vendor.userId).toBe(user.id);
      expect(vendor.storeName).toBe('Test Store');
    });

    describe('getVendorById', () => {
      it('should return the vendor by ID', async () => {
        const user = await prisma.user.create({
          data: {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password',
            role: 'VENDOR',
          },
        });

        const vendor = await service.createVendor({
          userId: user.id,
          storeName: 'Test Store',
          storeDescription: 'Description for Test Store',
        });

        const foundVendor = await service.getVendorById(vendor.id);

        expect(foundVendor).toBeDefined();
        expect(foundVendor.id).toBe(vendor.id);
        expect(foundVendor.userId).toBe(user.id);
        expect(foundVendor.storeName).toBe('Test Store');
      });

      it('should throw NotFoundException if vendor does not exist', async () => {
        await expect(service.getVendorById(999)).rejects.toThrow(
          'Vendor not found'
        );
      });
    });
  });

  describe('updateVendor', () => {
    it('should update the vendor successfully', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
          role: 'VENDOR',
        },
      });

      const vendor = await service.createVendor({
        userId: user.id,
        storeName: 'Test Store',
        storeDescription: 'Description for Test Store',
      });

      const updatedVendor = await service.updateVendor(vendor.id, {
        storeName: 'Updated Test Store',
      });

      expect(updatedVendor).toBeDefined();
      expect(updatedVendor.storeName).toBe('Updated Test Store');
    });
  });

  describe('deleteVendor', () => {
    it('should delete the vendor successfully', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password',
          role: 'VENDOR',
        },
      });

      const vendor = await service.createVendor({
        userId: user.id,
        storeName: 'Test Store',
        storeDescription: 'Description for Test Store',
      });

      const result = await service.deleteVendor(vendor.id);

      expect(result.message).toBe('Vendor deleted successfully');
      const deletedVendor = await prisma.vendor.findUnique({
        where: { id: vendor.id },
      });
      expect(deletedVendor).toBeNull();
    });
  });
});
