import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class GrpcMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startTime = Date.now();
    const methodName = context.getHandler().name;
    const className = context.getClass().name;
    const fullMethodName = `${className}.${methodName}`;

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - startTime) / 1000;
        this.metricsService.incrementGrpcRequests(fullMethodName, 'success');
        this.metricsService.observeGrpcRequestDuration(fullMethodName, 'success', duration);
      }),
      catchError((error) => {
        const duration = (Date.now() - startTime) / 1000;
        this.metricsService.incrementGrpcRequests(fullMethodName, 'error');
        this.metricsService.observeGrpcRequestDuration(fullMethodName, 'error', duration);
        return throwError(error);
      })
    );
  }
}
