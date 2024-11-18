/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// export const protobufPackage = "product";

export interface CreateProductRequest {
  name: string;
  sku: string;
  stock: number;
  price: number;
}

export interface CreateProductResponse {
  status: number;
  errors: string[];
  id: number;
}

export interface FindOneData {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: number;
}

export interface FindOneProductRequest {
  id: number;
}

export interface FindOneProductResponse {
  status: number;
  errors: string[];
  data: FindOneData | undefined;
}

export interface DecreaseStockRequest {
  id: number;
}

export interface DecreaseStockResponse {
  status: number;
  errors: string[];
}

export const PRODUCT_PACKAGE_NAME = 'product';

export interface ProductServiceClient {
  createProduct(
    request: CreateProductRequest
  ): Observable<CreateProductResponse>;

  findOneProduct(
    request: FindOneProductRequest
  ): Observable<FindOneProductResponse>;

  decreaseStock(
    request: DecreaseStockRequest
  ): Observable<DecreaseStockResponse>;
}

export interface ProductServiceController {
  createProduct(
    request: CreateProductRequest
  ):
    | Promise<CreateProductResponse>
    | Observable<CreateProductResponse>
    | CreateProductResponse;

  findOneProduct(
    request: FindOneProductRequest
  ):
    | Promise<FindOneProductResponse>
    | Observable<FindOneProductResponse>
    | FindOneProductResponse;

  decreaseStock(
    request: DecreaseStockRequest
  ):
    | Promise<DecreaseStockResponse>
    | Observable<DecreaseStockResponse>
    | DecreaseStockResponse;
}

export function ProductServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'createProduct',
      'findOneProduct',
      'decreaseStock',
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod('ProductService', method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcStreamMethod('ProductService', method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const PRODUCT_SERVICE_NAME = 'ProductService';
