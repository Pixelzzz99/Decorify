import { Test, TestingModule } from '@nestjs/testing';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_SERVICE_NAME } from '@sofa-web/common';

describe('AuthController', () => {
  let controller: AuthController;
  let mockClient: ClientGrpc;
  let mockAuthService: Partial<AuthService>;

  beforeEach(async () => {
    mockClient = {
      getService: jest.fn(),
      getClientByServiceName: jest.fn(),
    } as unknown as ClientGrpc;

    mockAuthService = {
      // Add mock methods here if needed
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AUTH_SERVICE_NAME,
          useValue: mockClient,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
