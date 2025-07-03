import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const requestId = Math.random().toString(36).substr(2, 9);

    // Логируем входящий запрос
    this.logger.log(`[${requestId}] ${method} ${originalUrl} - ${ip} - ${userAgent} - User: ${req.user?.id || 'anonymous'}`);

    // Перехватываем завершение ответа
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      const contentLength = res.get('Content-Length');

      this.logger.log(`[${requestId}] Completed ${statusCode} in ${duration}ms - ${contentLength || 0} bytes`);
    });

    next();
  }
}
