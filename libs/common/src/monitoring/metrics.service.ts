import { Injectable, OnModuleInit } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

export interface MicroserviceMetricsConfig {
  serviceName: string;
  port: number;
}

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly serviceName: string;
  private readonly port: number;

  // Метрики HTTP запросов
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;

  // Метрики gRPC запросов
  private readonly grpcRequestsTotal: Counter<string>;
  private readonly grpcRequestDuration: Histogram<string>;

  // Метрики системы
  private readonly memoryUsage: Gauge<string>;
  private readonly cpuUsage: Gauge<string>;

  // Метрики базы данных
  private readonly dbConnectionsActive: Gauge<string>;
  private readonly dbQueryDuration: Histogram<string>;
  private readonly dbQueriesTotal: Counter<string>;

  constructor(config: MicroserviceMetricsConfig) {
    this.serviceName = config.serviceName;
    this.port = config.port;

    // Настройка HTTP метрик
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'service'],
      registers: [register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code', 'service'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register],
    });

    // Настройка gRPC метрик
    this.grpcRequestsTotal = new Counter({
      name: 'grpc_requests_total',
      help: 'Total number of gRPC requests',
      labelNames: ['method', 'service', 'status'],
      registers: [register],
    });

    this.grpcRequestDuration = new Histogram({
      name: 'grpc_request_duration_seconds',
      help: 'Duration of gRPC requests in seconds',
      labelNames: ['method', 'service', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [register],
    });

    // Настройка системных метрик
    this.memoryUsage = new Gauge({
      name: 'memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['service', 'type'],
      registers: [register],
    });

    this.cpuUsage = new Gauge({
      name: 'cpu_usage_percent',
      help: 'CPU usage percentage',
      labelNames: ['service'],
      registers: [register],
    });

    // Настройка метрик БД
    this.dbConnectionsActive = new Gauge({
      name: 'db_connections_active',
      help: 'Number of active database connections',
      labelNames: ['service', 'database'],
      registers: [register],
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['service', 'operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
      registers: [register],
    });

    this.dbQueriesTotal = new Counter({
      name: 'db_queries_total',
      help: 'Total number of database queries',
      labelNames: ['service', 'operation', 'table', 'status'],
      registers: [register],
    });
  }

  onModuleInit() {
    // Включаем дефолтные метрики Node.js
    collectDefaultMetrics({
      register,
      prefix: `${this.serviceName}_`,
      labels: { service: this.serviceName },
    });

    // Запускаем периодическое обновление системных метрик
    this.startSystemMetricsCollection();
  }

  // HTTP метрики
  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
      service: this.serviceName,
    });
  }

  observeHttpRequestDuration(method: string, route: string, statusCode: number, durationSeconds: number) {
    this.httpRequestDuration.observe({
      method,
      route,
      status_code: statusCode.toString(),
      service: this.serviceName,
    }, durationSeconds);
  }

  // gRPC метрики
  incrementGrpcRequests(method: string, status: string) {
    this.grpcRequestsTotal.inc({
      method,
      service: this.serviceName,
      status,
    });
  }

  observeGrpcRequestDuration(method: string, status: string, durationSeconds: number) {
    this.grpcRequestDuration.observe({
      method,
      service: this.serviceName,
      status,
    }, durationSeconds);
  }

  // База данных метрики
  setDbConnections(count: number, database = 'postgresql') {
    this.dbConnectionsActive.set({
      service: this.serviceName,
      database,
    }, count);
  }

  incrementDbQueries(operation: string, table: string, status: 'success' | 'error') {
    this.dbQueriesTotal.inc({
      service: this.serviceName,
      operation,
      table,
      status,
    });
  }

  observeDbQueryDuration(operation: string, table: string, durationSeconds: number) {
    this.dbQueryDuration.observe({
      service: this.serviceName,
      operation,
      table,
    }, durationSeconds);
  }

  // Получение всех метрик для endpoint /metrics
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Периодическое обновление системных метрик
  private startSystemMetricsCollection() {
    setInterval(() => {
      const memUsage = process.memoryUsage();

      this.memoryUsage.set({
        service: this.serviceName,
        type: 'rss',
      }, memUsage.rss);

      this.memoryUsage.set({
        service: this.serviceName,
        type: 'heapUsed',
      }, memUsage.heapUsed);

      this.memoryUsage.set({
        service: this.serviceName,
        type: 'heapTotal',
      }, memUsage.heapTotal);

      this.memoryUsage.set({
        service: this.serviceName,
        type: 'external',
      }, memUsage.external);

      // CPU usage - упрощенная версия
      const cpuUsage = process.cpuUsage();
      const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Конвертируем в проценты

      this.cpuUsage.set({
        service: this.serviceName,
      }, cpuPercent);

    }, 5000); // Обновляем каждые 5 секунд
  }
}
