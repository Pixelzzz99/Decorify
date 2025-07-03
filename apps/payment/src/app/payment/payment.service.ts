import { Injectable } from '@nestjs/common';
import {
  ProcessPaymentRequest,
  ProcessPaymentResponse,
  GetPaymentStatusRequest,
  GetPaymentStatusResponse,
  RefundPaymentRequest,
  RefundPaymentResponse,
} from '@sofa-web/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency,
        payment_method: request.cardToken,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      return {
        status: 200,
        errors: [],
        paymentId: paymentIntent.id,
        transactionId: paymentIntent.client_secret || '',
      };
    } catch (error) {
      return {
        status: 400,
        errors: [error.message],
        paymentId: '',
        transactionId: '',
      };
    }
  }

  async getPaymentStatus(request: GetPaymentStatusRequest): Promise<GetPaymentStatusResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(request.paymentId);

      return {
        status: 200,
        paymentStatus: paymentIntent.status,
        paymentId: paymentIntent.id,
      };
    } catch (error) {
      return {
        status: 404,
        paymentStatus: 'not_found',
        paymentId: request.paymentId,
      };
    }
  }

  async refundPayment(request: RefundPaymentRequest): Promise<RefundPaymentResponse> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: request.paymentId,
        amount: Math.round(request.amount * 100), // Convert to cents
        reason: 'requested_by_customer',
      });

      return {
        status: 200,
        errors: [],
        refundId: refund.id,
      };
    } catch (error) {
      return {
        status: 400,
        errors: [error.message],
        refundId: '',
      };
    }
  }
}
