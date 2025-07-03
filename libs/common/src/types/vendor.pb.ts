/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export interface CreateVendorRequest {
  userId: number;
  storeName: string;
  storeDescription: string;
}

export interface GetVendorRequest {
  userId: number;
}

export interface UpdateVendorRequest {
  id: number;
  userId: number;
  storeName: string;
  storeDescription: string;
}

export interface DeleteVendorRequest {
  userId: number;
}

export interface VendorResponse {
  id: number;
  userId: number;
  storeName: string;
  storeDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteVendorResponse {
  message: string;
}

export interface CreateVendorResponse {
  status: number;
  errors: string[];
  vendor?: VendorResponse;
}

export interface GetVendorByIdRequest {
  id: number;
}

export interface GetVendorByIdResponse {
  status: number;
  vendor?: VendorResponse;
}

export interface UpdateVendorResponse {
  status: number;
  errors: string[];
  vendor?: VendorResponse;
}

export interface GetVendorsRequest {}

export interface GetVendorsResponse {
  status: number;
  vendors: VendorResponse[];
}

export const VENDOR_PACKAGE_NAME = "vendor";

export interface VendorServiceClient {
  createVendor(request: CreateVendorRequest): Observable<CreateVendorResponse>;
  getVendor(request: GetVendorRequest): Observable<GetVendorByIdResponse>;
  getVendorById(request: GetVendorByIdRequest): Observable<GetVendorByIdResponse>;
  getVendors(request: GetVendorsRequest): Observable<GetVendorsResponse>;
  updateVendor(request: UpdateVendorRequest): Observable<UpdateVendorResponse>;
  deleteVendor(request: DeleteVendorRequest): Observable<DeleteVendorResponse>;
}

export interface VendorServiceController {
  createVendor(request: CreateVendorRequest): Promise<VendorResponse> | Observable<VendorResponse> | VendorResponse;

  getVendor(request: GetVendorRequest): Promise<VendorResponse> | Observable<VendorResponse> | VendorResponse;

  updateVendor(request: UpdateVendorRequest): Promise<VendorResponse> | Observable<VendorResponse> | VendorResponse;

  deleteVendor(
    request: DeleteVendorRequest,
  ): Promise<DeleteVendorResponse> | Observable<DeleteVendorResponse> | DeleteVendorResponse;
}

export function VendorServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["createVendor", "getVendor", "updateVendor", "deleteVendor"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("VendorService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("VendorService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const VENDOR_SERVICE_NAME = "VendorService";
