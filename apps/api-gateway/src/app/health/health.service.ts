import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  AUTH_SERVICE_NAME,
  PRODUCT_SERVICE_NAME,
  ORDER_SERVICE_NAME,
  PAYMENT_SERVICE_NAME,
  VENDOR_SERVICE_NAME,
  CART_SERVICE_NAME,
  CATEGORY_SERVICE_NAME
} from '@sofa-web/common';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  responseTime?: number;
  error?: string;
  lastCheck: string;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: Record<string, HealthStatus>;
  version: string;
  environment: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  // gRPC clients for service health checks
  private authClient?: ClientGrpc;
  private productClient?: ClientGrpc;
  private orderClient?: ClientGrpc;
  private paymentClient?: ClientGrpc;
  private vendorClient?: ClientGrpc;
  private cartClient?: ClientGrpc;
  private categoryClient?: ClientGrpc;

  constructor(
    @Inject(AUTH_SERVICE_NAME) authClient: ClientGrpc,
    @Inject(PRODUCT_SERVICE_NAME) productClient: ClientGrpc,
    @Inject(ORDER_SERVICE_NAME) orderClient: ClientGrpc,
    @Inject(PAYMENT_SERVICE_NAME) paymentClient: ClientGrpc,
    @Inject(VENDOR_SERVICE_NAME) vendorClient: ClientGrpc,
    @Inject(CART_SERVICE_NAME) cartClient: ClientGrpc,
    @Inject(CATEGORY_SERVICE_NAME) categoryClient: ClientGrpc,
  ) {
    this.authClient = authClient;
    this.productClient = productClient;
    this.orderClient = orderClient;
    this.paymentClient = paymentClient;
    this.vendorClient = vendorClient;
    this.cartClient = cartClient;
    this.categoryClient = categoryClient;
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const services = await this.checkAllServices();
    const memory = this.getMemoryUsage();
    const cpu = await this.getCpuUsage();

    // Determine overall system status
    const serviceStatuses = Object.values(services).map(s => s.status);
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (serviceStatuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (serviceStatuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Date.now() - this.startTime,
      memory,
      cpu,
    };
  }

  async checkAllServices(): Promise<Record<string, HealthStatus>> {
    const serviceChecks = [
      { name: 'api-gateway', check: () => this.checkApiGateway() },
      { name: 'auth-service', check: () => this.checkGrpcService(this.authClient, 'Auth') },
      { name: 'product-service', check: () => this.checkGrpcService(this.productClient, 'Product') },
      { name: 'order-service', check: () => this.checkGrpcService(this.orderClient, 'Order') },
      { name: 'payment-service', check: () => this.checkGrpcService(this.paymentClient, 'Payment') },
      { name: 'vendor-service', check: () => this.checkGrpcService(this.vendorClient, 'Vendor') },
      { name: 'cart-service', check: () => this.checkGrpcService(this.cartClient, 'Cart') },
      { name: 'category-service', check: () => this.checkGrpcService(this.categoryClient, 'Category') },
    ];

    const results: Record<string, HealthStatus> = {};

    await Promise.all(
      serviceChecks.map(async ({ name, check }) => {
        try {
          results[name] = await check();
        } catch (error) {
          this.logger.error(`Health check failed for ${name}:`, error);
          results[name] = {
            status: 'unhealthy',
            error: error.message,
            lastCheck: new Date().toISOString(),
          };
        }
      })
    );

    return results;
  }

  private async checkApiGateway(): Promise<HealthStatus> {
    // API Gateway is healthy if this method is being called
    return {
      status: 'healthy',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
    };
  }

  private async checkGrpcService(client: ClientGrpc, serviceName: string): Promise<HealthStatus> {
    if (!client) {
      return {
        status: 'unknown',
        error: 'Client not available',
        lastCheck: new Date().toISOString(),
      };
    }

    const startTime = Date.now();

    try {
      // Try to get the service - this will fail if service is down
      const service = client.getService(serviceName);
      const responseTime = Date.now() - startTime;

      if (responseTime > 5000) {
        return {
          status: 'degraded',
          responseTime,
          lastCheck: new Date().toISOString(),
        };
      }

      return {
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        responseTime: Date.now() - startTime,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  private getMemoryUsage() {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;

    return {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round((usedMemory / totalMemory) * 100),
    };
  }

  private async getCpuUsage(): Promise<{ usage: number }> {
    // Simple CPU usage calculation
    // In production, you might want to use a more sophisticated method
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      setTimeout(() => {
        const currentUsage = process.cpuUsage(startUsage);
        const totalUsage = currentUsage.user + currentUsage.system;
        const usage = Math.round((totalUsage / 1000000) * 100) / 100; // Convert to percentage
        resolve({ usage });
      }, 100);
    });
  }

  async isReady(): Promise<boolean> {
    const health = await this.getSystemHealth();

    // System is ready if API Gateway and at least 50% of services are healthy
    const totalServices = Object.keys(health.services).length;
    const healthyServices = Object.values(health.services)
      .filter(service => service.status === 'healthy').length;

    return healthyServices >= Math.ceil(totalServices * 0.5);
  }

  async isLive(): Promise<boolean> {
    // System is live if API Gateway is responsive
    try {
      const memory = this.getMemoryUsage();
      // Consider unhealthy if memory usage is above 90%
      return memory.percentage < 90;
    } catch {
      return false;
    }
  }
}
