import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
    });
  }

  async retrievePaymentIntent(
    paymentId: string
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentId);
  }

  async createRefund(
    paymentId: string,
    amount?: number
  ): Promise<Stripe.Refund> {
    return this.stripe.refunds.create({
      payment_intent: paymentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }
}
