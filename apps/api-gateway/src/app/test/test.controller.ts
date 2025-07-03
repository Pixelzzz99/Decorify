import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('test')
@Controller('test')
export class TestController {
  @Get('health')
  @ApiOperation({
    summary: 'Тестовый эндпоинт для проверки работы сервиса',
    description: 'Возвращает статус работы API Gateway'
  })
  @ApiResponse({
    status: 200,
    description: 'Сервис работает корректно',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-07-03T13:00:00.000Z' },
        service: { type: 'string', example: 'api-gateway' },
        https: { type: 'boolean', example: true }
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      https: process.env.ENABLE_HTTPS === 'true',
      security: {
        middleware: ['SecurityHeaders', 'XssProtection', 'RequestLogging'],
        authentication: 'implemented',
        authorization: 'rbac-ready'
      }
    };
  }

  @Get('security-headers')
  @ApiOperation({
    summary: 'Тестовый эндпоинт для проверки security headers',
    description: 'Возвращает информацию о применённых security headers'
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о security headers',
  })
  getSecurityInfo() {
    return {
      message: 'Security headers applied via middleware',
      headers: [
        'X-Content-Type-Options: nosniff',
        'X-Frame-Options: DENY',
        'X-XSS-Protection: 1; mode=block',
        'Strict-Transport-Security: max-age=31536000; includeSubDomains',
        'Content-Security-Policy: default-src \'self\'',
        'Referrer-Policy: strict-origin-when-cross-origin'
      ]
    };
  }
}
