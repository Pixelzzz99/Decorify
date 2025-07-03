import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Предотвращение XSS атак
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Предотвращение MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Предотвращение clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Удаление заголовка X-Powered-By
    res.removeHeader('X-Powered-By');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
  }
}
