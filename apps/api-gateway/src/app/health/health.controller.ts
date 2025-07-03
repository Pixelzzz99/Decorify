import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'System Health Check',
    description: 'Полная проверка состояния API Gateway и всех подключенных микросервисов'
  })
  @ApiResponse({
    status: 200,
    description: 'Системная информация о состоянии сервисов',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2025-07-03T01:30:00.000Z',
        services: {
          'api-gateway': {
            status: 'healthy',
            responseTime: 5,
            lastCheck: '2025-07-03T01:30:00.000Z'
          },
          'auth-service': {
            status: 'healthy',
            responseTime: 120,
            lastCheck: '2025-07-03T01:30:00.000Z'
          }
        },
        version: '1.0.0',
        environment: 'development',
        uptime: 3600000,
        memory: {
          used: 45,
          total: 128,
          percentage: 35
        },
        cpu: {
          usage: 15.5
        }
      }
    }
  })
  async check(@Res() res: Response) {
    const health = await this.healthService.getSystemHealth();

    // Set HTTP status based on overall health
    const statusCode = health.status === 'healthy' ? HttpStatus.OK :
                      health.status === 'degraded' ? HttpStatus.OK :
                      HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json(health);
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness Check',
    description: 'Проверка готовности системы к обработке запросов (Kubernetes readinessProbe)'
  })
  @ApiResponse({
    status: 200,
    description: 'Система готова к работе',
    schema: {
      example: {
        status: 'ready',
        timestamp: '2025-07-03T01:30:00.000Z',
        checks: {
          services: 'healthy',
          database: 'connected'
        }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'Система не готова к работе'
  })
  async ready(@Res() res: Response) {
    const isReady = await this.healthService.isReady();
    const statusCode = isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json({
      status: isReady ? 'ready' : 'not-ready',
      timestamp: new Date().toISOString(),
      ready: isReady
    });
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness Check',
    description: 'Проверка жизнеспособности приложения (Kubernetes livenessProbe)'
  })
  @ApiResponse({
    status: 200,
    description: 'Приложение работает',
    schema: {
      example: {
        status: 'alive',
        timestamp: '2025-07-03T01:30:00.000Z',
        uptime: 3600000
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'Приложение требует перезапуска'
  })
  async live(@Res() res: Response) {
    const isLive = await this.healthService.isLive();
    const statusCode = isLive ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

    res.status(statusCode).json({
      status: isLive ? 'alive' : 'dead',
      timestamp: new Date().toISOString(),
      alive: isLive,
      uptime: process.uptime() * 1000 // Convert to milliseconds
    });
  }
}
