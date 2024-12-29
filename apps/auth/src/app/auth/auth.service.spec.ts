import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from './jwt.service';
import { ConfigModule } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '@sofa-web/prisma';
import { JwtModule } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'secret',
          signOptions: { expiresIn: '1d' },
        }),
      ],
      providers: [AuthService, JwtService, AuthRepository, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw UnauthorizedException if user already exists', async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'hashedpassword',
          role: 'CUSTOMER',
        },
      });

      await expect(
        service.register({
          name: 'testuser',
          email: 'test@example.com',
          password: 'password',
          role: 'VENDOR',
        })
      ).rejects.toThrow('User already exists');
    });

    it('should create a new user', async () => {
      const result = await service.register({
        name: 'newuser',
        email: 'new@example.com',
        password: 'password',
        role: 'CUSTOMER',
      });

      const user = await prisma.user.findUnique({
        where: { email: 'new@example.com' },
      });

      expect(user).toBeDefined();
      expect(user.username).toBe('newuser');
      expect(user.role).toBe('CUSTOMER');
      expect(result.status).toBe(201);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: await service['jwtService'].hashPassword('password'),
          role: 'CUSTOMER',
        },
      });
    });

    it('should retrun unauthorized if user is not found', async () => {
      const result = await service.login({
        email: 'notfound@example.com',
        password: 'password',
      });

      expect(result.status).toBe(401);
      expect(result.errors).toEqual(['Invalid credentials']);
    });

    it('should return unauthorized if password is wrong', async () => {
      const result = await service.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(result.status).toBe(401);
      expect(result.errors).toEqual(['Invalid credentials']);
    });

    it('should return a token if login is successful', async () => {
      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.status).toBe(200);
      expect(result.token).toBeDefined();
    });
  });

  describe('validate', () => {
    let token: string;

    beforeEach(async () => {
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          password: await service['jwtService'].hashPassword('password'),
          role: 'CUSTOMER',
        },
      });

      token = service['jwtService'].generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    });

    it('should return forbidden if token is invalid', async () => {
      const result = await service.validate({ token: 'invalidtoken' });

      expect(result.status).toBe(403);
      expect(result.errors).toEqual(['Invalid token']);
    });

    it('should return user if token is valid', async () => {
      const result = await service.validate({ token });

      expect(result.status).toBe(200);
      expect(result.userId).toBeDefined();
    });
  });
});
