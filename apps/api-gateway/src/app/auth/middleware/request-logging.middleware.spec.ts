import { RequestLoggingMiddleware } from './request-logging.middleware';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Mock the Logger
jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
  })),
}));

describe('RequestLoggingMiddleware', () => {
  let middleware: RequestLoggingMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    middleware = new RequestLoggingMiddleware();
    // Access private logger property for testing
    mockLogger = (middleware as unknown as { logger: jest.Mocked<Logger> }).logger;

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'Jest Test Agent',
      },
    };

    mockResponse = {
      on: jest.fn(),
      get: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should log incoming request', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test - 127.0.0.1 - Jest Test Agent - User: anonymous')
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log authenticated user request', () => {
    const authenticatedRequest = mockRequest as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: 123,
      email: 'test@example.com',
      role: 'CUSTOMER',
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test - 127.0.0.1 - Jest Test Agent - User: 123')
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle missing user-agent header', () => {
    mockRequest.headers = {};

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test - 127.0.0.1 -  - User: anonymous')
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set up response finish listener', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(mockNext).toHaveBeenCalled();
  });

  it('should log response completion', () => {
    let finishCallback: (() => void) | undefined;

    (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback = callback;
      }
    });

    Object.defineProperty(mockResponse, 'statusCode', { value: 200, writable: true });
    (mockResponse.get as jest.Mock).mockReturnValue('1024');

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    // Simulate response finish
    if (finishCallback) {
      finishCallback();
    }

    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringMatching(/\[[\w\d]+\] Completed 200 in \d+ms - 1024 bytes/)
    );
  });
});
