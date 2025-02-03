import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CartService } from './cart.service';
import { status } from '@grpc/grpc-js';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @GrpcMethod('CartService', 'AddToCart')
  async addToCart(data: {
    userId: number;
    productId: number;
    quantity: number;
  }) {
    try {
      const result = await this.cartService.addToCart(
        data.userId,
        data.productId,
        data.quantity
      );
      return { status: status.OK, data: result };
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: error.message,
      });
    }
  }

  @GrpcMethod('CartService', 'RemoveFromCart')
  async removeFromCart(data: { userId: number; productId: number }) {
    try {
      const result = await this.cartService.removeFromCart(
        data.userId,
        data.productId
      );
      return { status: status.OK, data: result };
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: error.message,
      });
    }
  }

  @GrpcMethod('CartService', 'GetCart')
  async getCart(data: { userId: number }) {
    try {
      const result = await this.cartService.getCart(data.userId.toString());
      return { status: status.OK, data: result };
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: error.message,
      });
    }
  }

  @GrpcMethod('CartService', 'UpdateCartItem')
  async updateCartItem(data: {
    userId: number;
    productId: number;
    quantity: number;
  }) {
    try {
      const result = await this.cartService.updateCartItem(
        data.userId,
        data.productId,
        data.quantity
      );
      return { status: status.OK, data: result };
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: error.message,
      });
    }
  }

  @GrpcMethod('CartService', 'SyncCart')
  async syncCart(data: { userId: number; deviceId: string }) {
    try {
      const result = await this.cartService.syncCart(
        data.userId,
        data.deviceId
      );
      return { status: status.OK, data: result };
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: error.message,
      });
    }
  }
}
