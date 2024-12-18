import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@sofa-web/prisma';
import { OrderStatus } from '@prisma/client';

interface PaymentSerice {
  processPayment(data: any): Promise<any>;
  getPaymentStatus(data: any): Promise<any>;
}

interface CartService {
  getCart(data: { userId: string }): Promise<any>;
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
    const cart = await firstValueFrom(
      await this.cartService.getCart({ userId })
    );

    if (!cart || cart.items.length) {
      throw new Error('Cart is empty');
    }

    const order = await this.prisma.order.create({
      data: {
        userId: +userId,
        shippingAddress,
        totalPrice: cart.total,
        OrderItems: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
        orderStatus: OrderStatus.CREATED,
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
