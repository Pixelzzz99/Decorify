import { Injectable } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Injectable()
export class PaymentService {
  constructor(private readonly stripeService: StripeService) {}

  async processPayment(orderId: string, amount: number, currency: string) {
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(
        amount,
        currency
      );
      return {
        paymentId: paymentIntent.id,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      throw new Error('Error processing payment: ' + error.message);
    }
  }

  async getPaymentStatus(paymentId: string) {
    try {
      const paymentIntent = await this.stripeService.retrievePaymentIntent(
        paymentId
      );
      return {
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      throw new Error('Error getting payment status: ' + error.message);
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refund = await this.stripeService.createRefund(paymentId, amount);
      return {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
      };
    } catch (error) {
      throw new Error('Refund failed: ' + error.message);
    }
  }
}
