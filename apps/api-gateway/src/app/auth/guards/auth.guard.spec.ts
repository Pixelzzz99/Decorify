import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { AUTH_SERVICE_NAME, AuthServiceClient } from '@sofa-web/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockClient: ClientGrpc;
  let mockAuthService: Partial<AuthServiceClient>;

  beforeEach(async () => {
    mockAuthService = {
      validateToken: jest.fn() as jest.MockedFunction<AuthServiceClient['validateToken']>,
    };

    mockClient = {
      getService: jest.fn().mockReturnValue(mockAuthService),
      getClientByServiceName: jest.fn(),
    } as unknown as ClientGrpc;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AUTH_SERVICE_NAME,
          useValue: mockClient,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    guard.onModuleInit(); // Инициализируем authService
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException when no token provided', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when invalid token provided', async () => {
    (mockAuthService.validateToken as jest.Mock).mockReturnValue(
      of({ status: 401, userId: null })
    );

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer invalid-token',
          },
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(UnauthorizedException);
  });

  it('should return true and set user when valid token provided', async () => {
    (mockAuthService.validateToken as jest.Mock).mockReturnValue(
      of({ status: 200, userId: 1 })
    );

    const mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockRequest).toHaveProperty('user');
    expect((mockRequest as { user?: unknown }).user).toEqual({
      id: 1,
      email: 'user@example.com',
      role: 'CUSTOMER'
    });
  });
});
