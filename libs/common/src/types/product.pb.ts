/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// export const protobufPackage = "product";

export interface Product {
  id: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  weight: number;
  images: ProductImage[];
  categories: ProductCategory[];
  createdAt: string;
  /**
   * repeated OrderItem orderItems = 15;
   * repeated Review reviews = 16;
   * repeated CartItem cartItems = 17;
   */
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
}

export interface ProductCategory {
  id: number;
  categoryId: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
}

export interface Review {
  id: number;
  productId: number;
  reviewText: string;
  rating: number;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
}

export interface CreateProducRequest {
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  weight: number;
  vendorId: number;
  categoryIds: number[];
  imageUrls: string[];
}

export interface CreateProductResponse {
  product: Product | undefined;
}

export interface UpdateProductRequest {
  id: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  weight: number;
  categoryIds: number[];
  imageUrls: string[];
}

export interface UpdateProductResponse {
  product: Product | undefined;
}

export interface GetProductByIdRequest {
  id: number;
}

export interface GetProductByIdResponse {
  product: Product | undefined;
}

export interface GetProductsRequest {
  skip: number;
  take: number;
}

export interface GetProductsResponse {
  products: Product[];
}

export interface DeleteProductRequest {
  id: number;
}

export interface DeleteProductResponse {
  message: string;
}

export const PRODUCT_PACKAGE_NAME = 'product';

export interface ProductServiceClient {
  createProduct(
    request: CreateProducRequest
  ): Observable<CreateProductResponse>;

  updateProduct(
    request: UpdateProductRequest
  ): Observable<UpdateProductResponse>;

  getProductById(
    request: GetProductByIdRequest
  ): Observable<GetProductByIdResponse>;

  getProducts(request: GetProductsRequest): Observable<GetProductsResponse>;

  deleteProduct(
    request: DeleteProductRequest
  ): Observable<DeleteProductResponse>;
}

export interface ProductServiceController {
  createProduct(
    request: CreateProducRequest
  ):
    | Promise<CreateProductResponse>
    | Observable<CreateProductResponse>
    | CreateProductResponse;

  updateProduct(
    request: UpdateProductRequest
  ):
    | Promise<UpdateProductResponse>
    | Observable<UpdateProductResponse>
    | UpdateProductResponse;

  getProductById(
    request: GetProductByIdRequest
  ):
    | Promise<GetProductByIdResponse>
    | Observable<GetProductByIdResponse>
    | GetProductByIdResponse;

  getProducts(
    request: GetProductsRequest
  ):
    | Promise<GetProductsResponse>
    | Observable<GetProductsResponse>
    | GetProductsResponse;

  deleteProduct(
    request: DeleteProductRequest
  ):
    | Promise<DeleteProductResponse>
    | Observable<DeleteProductResponse>
    | DeleteProductResponse;
}

export function ProductServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'createProduct',
      'updateProduct',
      'getProductById',
      'getProducts',
      'deleteProduct',
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
