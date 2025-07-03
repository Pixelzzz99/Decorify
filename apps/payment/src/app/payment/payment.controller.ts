import { Controller } from '@nestjs/common';
import {
  PaymentServiceController,
  PaymentServiceControllerMethods,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  GetPaymentStatusRequest,
  GetPaymentStatusResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
} from '@sofa-web/common';
import { PaymentService } from './payment.service';

@Controller()
@PaymentServiceControllerMethods()
export class PaymentController implements PaymentServiceController {
  constructor(private readonly paymentService: PaymentService) {}

  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    return this.paymentService.processPayment(request);
  }

  async getPaymentStatus(request: GetPaymentStatusRequest): Promise<GetPaymentStatusResponse> {
    return this.paymentService.getPaymentStatus(request);
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    return this.paymentService.refundPayment(request);
  }
}
