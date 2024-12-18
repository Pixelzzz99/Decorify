import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CartService } from './cart.service';

@Controller()
export class CartController {
  constructor(private cartService: CartService) {}

  @GrpcMethod('CartService', 'AddItem')
  async addItem(data: { userId: string; productId: string; quantity: number }) {
    return await this.cartService.addItem(
      data.userId,
      data.productId,
      data.quantity
    );
  }

  @GrpcMethod('CartService', 'RemoveItem')
  async removeItem(data: { userId: string; productId: string }) {
    return await this.cartService.removeItem(data.userId, data.productId);
  }

  @GrpcMethod('CartService', 'GetCart')
  async getCart(data: { userId: string }) {
    return await this.cartService.getCart(data.userId);
  }

  @GrpcMethod('CartService', 'UpdateQuantity')
  async updateQuantity(data: {
    userId: string;
    productId: string;
    quantity: number;
  }) {
    return await this.cartService.updateQuantity(
      data.userId,
      data.productId,
      data.quantity
    );
  }
}
