/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export interface ProcessPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  cardToken: string;
}

export interface ProcessPaymentResponse {
  status: number;
  errors: string[];
  paymentId: string;
  transactionId: string;
}

export interface GetPaymentStatusRequest {
  paymentId: string;
}

export interface GetPaymentStatusResponse {
  status: number;
  paymentStatus: string;
  paymentId: string;
}

export interface RefundPaymentRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface RefundPaymentResponse {
  status: number;
  errors: string[];
  refundId: string;
}

export const PAYMENT_PACKAGE_NAME = "payment";

export interface PaymentServiceClient {
  processPayment(request: ProcessPaymentRequest): Observable<ProcessPaymentResponse>;

  getPaymentStatus(request: GetPaymentStatusRequest): Observable<GetPaymentStatusResponse>;

  refundPayment(request: RefundPaymentRequest): Observable<RefundPaymentResponse>;
}

export interface PaymentServiceController {
  processPayment(
    request: ProcessPaymentRequest,
  ): Promise<ProcessPaymentResponse> | Observable<ProcessPaymentResponse> | ProcessPaymentResponse;

  getPaymentStatus(
    request: GetPaymentStatusRequest,
  ): Promise<GetPaymentStatusResponse> | Observable<GetPaymentStatusResponse> | GetPaymentStatusResponse;

  refundPayment(
    request: RefundPaymentRequest,
  ): Promise<RefundPaymentResponse> | Observable<RefundPaymentResponse> | RefundPaymentResponse;
}

export function PaymentServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["processPayment", "getPaymentStatus", "refundPayment"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("PaymentService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("PaymentService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const PAYMENT_SERVICE_NAME = "PaymentService";
