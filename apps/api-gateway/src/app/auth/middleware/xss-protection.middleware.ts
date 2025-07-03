import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FilterXSS } from 'xss';

@Injectable()
export class XssProtectionMiddleware implements NestMiddleware {
  private xssFilter = new FilterXSS({
    whiteList: {}, // Не разрешаем никаких HTML тегов
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script'],
  });

  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    if (req.query) {
      req.query = this.sanitizeObject(req.query) as Request['query'];
    }

    if (req.params) {
      req.params = this.sanitizeObject(req.params) as Request['params'];
    }

    next();
  }

  private sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return this.xssFilter.process(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = this.sanitizeObject((obj as Record<string, unknown>)[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }
}
