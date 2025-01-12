/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';

// export const protobufPackage = "category";

export interface Category {
  id: number;
  categoryName: string;
  parentCategoryId: number;
  createAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
  parentCategoryId: number;
}

export interface CreateCategoryResponse {
  category: Category | undefined;
}

export interface UpdateCategoryRequest {
  id: number;
  categoryName: string;
  parentCategoryId: number;
}

export interface UpdateCategoryResponse {
  category: Category | undefined;
}

export interface GetCategoryByIdRequest {
  id: number;
}

export interface GetCategoryByIdResponse {
  category: Category | undefined;
}

export interface GetCategoriesRequest {}

export interface GetCategoriesResponse {
  categories: Category[];
}

export interface DeleteCategoryRequest {
  id: number;
}

export interface DeleteCategoryResponse {
  message: string;
}

export const CATEGORY_PACKAGE_NAME = 'category';

export interface CategoryServiceClient {
  createCategory(
    request: CreateCategoryRequest
  ): Observable<CreateCategoryResponse>;

  updateCategory(
    request: UpdateCategoryRequest
  ): Observable<UpdateCategoryResponse>;

  getCategoryById(
    request: GetCategoryByIdRequest
  ): Observable<GetCategoryByIdResponse>;

  getCategories(
    request: GetCategoriesRequest
  ): Observable<GetCategoriesResponse>;

  deleteCategory(
    request: DeleteCategoryRequest
  ): Observable<DeleteCategoryResponse>;
}

export interface CategoryServiceController {
  createCategory(
    request: CreateCategoryRequest
  ):
    | Promise<CreateCategoryResponse>
    | Observable<CreateCategoryResponse>
    | CreateCategoryResponse;

  updateCategory(
    request: UpdateCategoryRequest
  ):
    | Promise<UpdateCategoryResponse>
    | Observable<UpdateCategoryResponse>
    | UpdateCategoryResponse;

  getCategoryById(
    request: GetCategoryByIdRequest
  ):
    | Promise<GetCategoryByIdResponse>
    | Observable<GetCategoryByIdResponse>
    | GetCategoryByIdResponse;

  getCategories(
    request: GetCategoriesRequest
  ):
    | Promise<GetCategoriesResponse>
    | Observable<GetCategoriesResponse>
    | GetCategoriesResponse;

  deleteCategory(
    request: DeleteCategoryRequest
  ):
    | Promise<DeleteCategoryResponse>
    | Observable<DeleteCategoryResponse>
    | DeleteCategoryResponse;
}

export function CategoryServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      'createCategory',
      'updateCategory',
      'getCategoryById',
      'getCategories',
      'deleteCategory',
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method
      );
      GrpcMethod('CategoryService', method)(
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
      GrpcStreamMethod('CategoryService', method)(
        constructor.prototype[method],
        method,
        descriptor
      );
    }
  };
}

export const CATEGORY_SERVICE_NAME = 'CategoryService';
