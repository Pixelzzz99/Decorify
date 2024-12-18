import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { OrderStatus } from '@prisma/client';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @GrpcMethod('OrderService', 'CreateOrder')
  async createOrder(data: { userId: string; shippingAddress: string }) {
    return this.orderService.createOrder(data.userId, data.shippingAddress);
  }

  @GrpcMethod('OrderService', 'GetOrder')
  async getOrder(data: { orderId: string }) {
    return this.orderService.getOrder(data.orderId);
  }

  @GrpcMethod('OrderService', 'UpdateOrderStatus')
  async updateOrderStatus(data: { orderId: string; status: OrderStatus }) {
    return this.orderService.updateOrderStatus(data.orderId, data.status);
  }

  @GrpcMethod('OrderService', 'GetUserOrders')
  async getUserOrders(data: { userId: string; page: number; limit: number }) {
    return this.orderService.getUserOrders(data.userId, data.page, data.limit);
  }
}
