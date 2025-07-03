import { Test, TestingModule } from '@nestjs/testing';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { AUTH_SERVICE_NAME } from '@sofa-web/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockClient: ClientGrpc;

  beforeEach(async () => {
    mockClient = {
      getService: jest.fn(),
      getClientByServiceName: jest.fn(),
    } as unknown as ClientGrpc;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AUTH_SERVICE_NAME,
          useValue: mockClient,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
