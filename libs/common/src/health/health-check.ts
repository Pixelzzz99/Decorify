/**
 * Universal Health Check utility for Railway deployment
 * Creates HTTP server for health checks alongside gRPC microservices
 */

import express from 'express';
import { Logger } from '@nestjs/common';
import { Server } from 'http';

export interface HealthCheckOptions {
  serviceName: string;
  port: number;
  grpcPort?: number;
  customChecks?: () => Promise<Record<string, unknown>>;
}

export class HealthCheckServer {
  private app: express.Application;
  private server: Server | null = null;
  private logger = new Logger('HealthCheckServer');

  constructor(private options: HealthCheckOptions) {
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const healthData = {
          status: 'ok',
          service: this.options.serviceName,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0',
          railway: {
            deployment_id: process.env.RAILWAY_DEPLOYMENT_ID,
            replica_id: process.env.RAILWAY_REPLICA_ID,
            service_id: process.env.RAILWAY_SERVICE_ID
          },
          ports: {
            http: this.options.port,
            ...(this.options.grpcPort && { grpc: this.options.grpcPort })
          },
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
          }
        };

        // Add custom health checks if provided
        if (this.options.customChecks) {
          const customData = await this.options.customChecks();
          Object.assign(healthData, customData);
        }

        res.json(healthData);
      } catch (error) {
        this.logger.error(`Health check failed: ${error.message}`, error.stack);
        res.status(500).json({
          status: 'error',
          service: this.options.serviceName,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Ready check endpoint
    this.app.get('/ready', (req, res) => {
      res.json({
        status: 'ready',
        service: this.options.serviceName,
        timestamp: new Date().toISOString()
      });
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: this.options.serviceName,
        status: 'running',
        endpoints: ['/health', '/ready']
      });
    });
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.options.port, '0.0.0.0', () => {
        this.logger.log(
          `🔍 Health check server for ${this.options.serviceName} listening on port ${this.options.port}`
        );
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.logger.log(`Health check server for ${this.options.serviceName} stopped`);
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

/**
 * Helper function to get health check port for a service
 */
export function getHealthCheckPort(serviceName: string): number {
  // На Railway используем PORT переменную окружения
  if (process.env.PORT) {
    return parseInt(process.env.PORT);
  }

  // Локальная разработка - используем базовый порт + offset
  const basePort = parseInt(process.env.HEALTH_CHECK_PORT || '8080');

  const servicePortMap: Record<string, number> = {
    'auth': basePort + 1,        // 8081
    'product': basePort + 2,     // 8082
    'order': basePort + 3,       // 8083
    'payment': basePort + 4,     // 8084
    'vendor': basePort + 5,      // 8085
    'cart': basePort + 6         // 8086
  };

  return servicePortMap[serviceName] || basePort;
}
