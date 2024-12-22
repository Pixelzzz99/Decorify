import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @GrpcMethod('PaymentService', 'ProcessPayment')
  async processPayment(data: {
    orderId: string;
    amount: number;
    currency: string;
  }) {
    const { orderId, amount, currency } = data;
    return this.paymentService.processPayment(orderId, amount, currency);
  }

  @GrpcMethod('PaymentService', 'GetPaymentStatus')
  async getPaymentStatus(data: { paymentId: string }) {
    const { paymentId } = data;
    return this.paymentService.getPaymentStatus(paymentId);
  }

  @GrpcMethod('PaymentService', 'RefundPayment')
  async refundPayment(data: { paymentId: string; amount?: number }) {
    const { paymentId, amount } = data;
    return this.paymentService.refundPayment(paymentId, amount);
  }
}
