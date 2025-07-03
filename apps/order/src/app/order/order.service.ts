import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';
import { PrismaService } from '@sofa-web/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { Cart, GetCartResponse } from '@sofa-web/common';

interface PaymentSerice {
  processPayment(data: unknown): Promise<unknown>;
  getPaymentStatus(data: unknown): Promise<unknown>;
}

interface CartService {
  getCart(data: { userId: string }): Observable<GetCartResponse>;
}

@Injectable()
export class OrderService implements OnModuleInit {
  private paymentService: PaymentSerice;
  private cartService: CartService;

  constructor(
    @Inject('PAYMENT_SERVICE') private paymentClient: ClientGrpc,
    @Inject('CART_SERVICE') private cartClient: ClientGrpc,
    private prisma: PrismaService
  ) {}

  onModuleInit() {
    this.paymentService =
      this.paymentClient.getService<PaymentSerice>('PaymentService');
    this.cartService = this.cartClient.getService<CartService>('CartService');
  }

  async createOrder(userId: string, shippingAddress: string) {
    const cartResponse = await firstValueFrom(
      await this.cartService.getCart({ userId })
    );

    const cart = cartResponse.cart;
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const order = await this.prisma.order.create({
      data: {
        User: {
          connect: { id: +userId }
        },
        shippingAddress,
        totalPrice: cart.total,
        OrderItems: {
          create: cart.items.map((item) => ({
            Product: {
              connect: { id: +item.productId }
            },
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
          })),
        },
        orderStatus: OrderStatus.CREATED,
        paymentStatus: PaymentStatus.UNPAID,
      },
      include: {
        OrderItems: true,
      },
    });

    return order;
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: +orderId,
      },
      include: {
        OrderItems: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.prisma.order.update({
      where: {
        id: +orderId,
      },
      data: { orderStatus: status },
      include: {
        OrderItems: true,
      },
    });

    return order;
  }

  async getUserOrders(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          userId: +userId,
        },
        skip,
        take: limit,
        include: {
          OrderItems: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.order.count({
        where: { userId: +userId },
      }),
    ]);

    return { orders, total };
  }
}
