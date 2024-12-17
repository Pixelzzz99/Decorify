/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "product";

export interface Product {
  id: number;
  vendorId: number;
  categoryId: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  dimensions: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
  imageUrls: ProductImage[];
  vendor: Vendor | undefined;
  category: Category | undefined;
  orderItems: OrderItem[];
  reviews: Review[];
  cartItems: CartItem[];
}

export interface ProductImage {
  id: number;
  url: string;
}

export interface Vendor {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
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

export interface GetProductsRequest {
  page: number;
  limit: number;
  category: Category | undefined;
}

export interface GetProductsResponse {
  status: number;
  total: number;
  products: Product[];
  errors: string[];
}

export interface GetProductRequest {
  id: number;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  stock: number;
  price: number;
}

export interface UpdateProductRequest {
  id: number;
  productName?: string | undefined;
  description?: string | undefined;
  price?: number | undefined;
  stockQuantity?: number | undefined;
  dimensions?: string | undefined;
  weight?: number | undefined;
  category: Category | undefined;
  imageUrls?: string | undefined;
  vendor?: Vendor | undefined;
}

export const PRODUCT_PACKAGE_NAME = "product";

export interface ProductServiceClient {
  getProducts(request: GetProductsRequest): Observable<GetProductsResponse>;

  getProduct(request: GetProductRequest): Observable<Product>;

  createProduct(request: CreateProductRequest): Observable<Product>;

  updateProduct(request: UpdateProductRequest): Observable<Product>;
}

export interface ProductServiceController {
  getProducts(
    request: GetProductsRequest,
  ): Promise<GetProductsResponse> | Observable<GetProductsResponse> | GetProductsResponse;

  getProduct(request: GetProductRequest): Promise<Product> | Observable<Product> | Product;

  createProduct(request: CreateProductRequest): Promise<Product> | Observable<Product> | Product;

  updateProduct(request: UpdateProductRequest): Promise<Product> | Observable<Product> | Product;
}

export function ProductServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getProducts", "getProduct", "createProduct", "updateProduct"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("ProductService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("ProductService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const PRODUCT_SERVICE_NAME = "ProductService";
