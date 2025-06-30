/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export interface CartItemData {
  productId: number;
  quantity: number;
  price: number;
}

export interface Cart {
  userId: string;
  items: CartItemData[];
  total: number;
}

export interface AddItemRequest {
  userId: string;
  productId: number;
  quantity: number;
}

export interface RemoveItemRequest {
  userId: string;
  productId: number;
}

export interface AddItemResponse {
  status: number;
  errors: string[];
  cart?: Cart;
}

export interface GetCartResponse {
  status: number;
  cart?: Cart;
}

export interface RemoveItemResponse {
  status: number;
  errors: string[];
  cart?: Cart;
}

export interface UpdateQuantityRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export interface UpdateQuantityResponse {
  status: number;
  errors: string[];
  cart?: Cart;
}

export interface ClearCartRequest {
  userId: string;
}

export interface ClearCartResponse {
  status: number;
  errors: string[];
}

export interface GetCartRequest {
  userId: string;
}

export interface UpdateCartRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export const CART_PACKAGE_NAME = "cart";

export interface CartServiceClient {
  addItem(request: AddItemRequest): Observable<AddItemResponse>;
  removeItem(request: RemoveItemRequest): Observable<RemoveItemResponse>;
  getCart(request: GetCartRequest): Observable<GetCartResponse>;
  updateQuantity(request: UpdateQuantityRequest): Observable<UpdateQuantityResponse>;
  clearCart(request: ClearCartRequest): Observable<ClearCartResponse>;
}

export interface CartServiceController {
  addItem(request: AddItemRequest): Promise<AddItemResponse> | Observable<AddItemResponse> | AddItemResponse;
  removeItem(request: RemoveItemRequest): Promise<RemoveItemResponse> | Observable<RemoveItemResponse> | RemoveItemResponse;
  getCart(request: GetCartRequest): Promise<GetCartResponse> | Observable<GetCartResponse> | GetCartResponse;
  updateQuantity(request: UpdateQuantityRequest): Promise<UpdateQuantityResponse> | Observable<UpdateQuantityResponse> | UpdateQuantityResponse;
  clearCart(request: ClearCartRequest): Promise<ClearCartResponse> | Observable<ClearCartResponse> | ClearCartResponse;
}

export function CartServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["addItem", "removeItem", "getCart", "updateQuantity", "clearCart"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("CartService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("CartService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const CART_SERVICE_NAME = "CartService";
