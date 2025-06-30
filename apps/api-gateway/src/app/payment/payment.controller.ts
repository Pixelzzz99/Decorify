import {
  Controller,
  Inject,
  Post,
  Get,
  OnModuleInit,
  UseGuards,
  Param,
  Body,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  PaymentServiceClient,
  PAYMENT_SERVICE_NAME,
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  GetPaymentStatusResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('payment')
export class PaymentController implements OnModuleInit {
  private svc: PaymentServiceClient;

  @Inject(PAYMENT_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<PaymentServiceClient>(PAYMENT_SERVICE_NAME);
  }

  @Post('process')
  @UseGuards(AuthGuard)
  private async processPayment(
    @Body() body: ProcessPaymentRequest
  ): Promise<Observable<ProcessPaymentResponse>> {
    return this.svc.processPayment(body);
  }

  @Get('status/:paymentId')
  @UseGuards(AuthGuard)
  private async getPaymentStatus(
    @Param('paymentId') paymentId: string
  ): Promise<Observable<GetPaymentStatusResponse>> {
    return this.svc.getPaymentStatus({ paymentId });
  }

  @Post('refund')
  @UseGuards(AuthGuard)
  private async refundPayment(
    @Body() body: RefundPaymentRequest
  ): Promise<Observable<RefundPaymentResponse>> {
    return this.svc.refundPayment(body);
  }
}
