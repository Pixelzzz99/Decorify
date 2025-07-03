import { XssProtectionMiddleware } from './xss-protection.middleware';
import { Request, Response, NextFunction } from 'express';

describe('XssProtectionMiddleware', () => {
  let middleware: XssProtectionMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new XssProtectionMiddleware();
    mockRequest = {};
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should sanitize XSS in request body', () => {
    mockRequest = {
      body: {
        message: '<script>alert("xss")</script>Hello World',
        description: 'Normal text',
      },
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body.message).toBe('Hello World');
    expect(mockRequest.body.description).toBe('Normal text');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should sanitize XSS in query parameters', () => {
    mockRequest = {
      query: {
        search: '<img src="x" onerror="alert(1)">test',
        filter: 'normal',
      },
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect((mockRequest.query as Record<string, string>).search).toBe('test');
    expect((mockRequest.query as Record<string, string>).filter).toBe('normal');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should sanitize XSS in route parameters', () => {
    mockRequest = {
      params: {
        id: '<script>evil()</script>123',
        slug: 'normal-slug',
      },
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect((mockRequest.params as Record<string, string>).id).toBe('123');
    expect((mockRequest.params as Record<string, string>).slug).toBe('normal-slug');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle string values directly', () => {
    mockRequest = {
      body: '<svg onload="alert(1)">',
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(typeof mockRequest.body).toBe('string');
    expect(mockRequest.body).not.toContain('<script>');
    expect(mockRequest.body).not.toContain('onload');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle nested objects', () => {
    mockRequest = {
      body: {
        user: {
          name: '<script>alert("nested")</script>John',
          bio: 'Normal bio text',
        },
        metadata: {
          tags: ['<img src=x onerror=alert(1)>tag1', 'normal-tag'],
        },
      },
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body.user.name).toBe('John');
    expect(mockRequest.body.user.bio).toBe('Normal bio text');
    expect(mockRequest.body.metadata.tags[0]).toBe('tag1');
    expect(mockRequest.body.metadata.tags[1]).toBe('normal-tag');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should preserve non-string values', () => {
    mockRequest = {
      body: {
        count: 42,
        active: true,
        price: 19.99,
        tags: null,
        metadata: undefined,
      },
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body.count).toBe(42);
    expect(mockRequest.body.active).toBe(true);
    expect(mockRequest.body.price).toBe(19.99);
    expect(mockRequest.body.tags).toBe(null);
    expect(mockRequest.body.metadata).toBe(undefined);
    expect(mockNext).toHaveBeenCalled();
  });
});
