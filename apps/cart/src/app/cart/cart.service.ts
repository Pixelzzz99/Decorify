import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { RedisService } from './redis.service';
import { firstValueFrom } from 'rxjs';

interface CatalogService {
  getProduct(data: { id: string }): Promise<any>;
}

@Injectable()
export class CartService implements OnModuleInit {
  private catalogService: CatalogService;

  constructor(
    @Inject('CATALOG_SERVICE') private client: ClientGrpc,
    private redisService: RedisService
  ) {}

  onModuleInit() {
    this.catalogService =
      this.client.getService<CatalogService>('CatalogService');
  }

  async getCart(userId: string) {
    const cartKey = this.redisService.getCartKey(userId);
    const cart = await this.redisService.get(cartKey);
    return cart || { userId, items: [], total: 0 };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await firstValueFrom(
      await this.catalogService.getProduct({ id: productId })
    );

    if (!product) {
      throw new Error('Product not found');
    }

    const cart = await this.getCart(userId);
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        price: product.price,
      });
    }
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.total = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await this.redisService.set(this.redisService.getCartKey(userId), cart);
    return cart;
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const cart = await this.getCart(userId);
    const item = cart.items.find((item) => item.productId === productId);

    if (!item) {
      throw new Error('Item not found');
    }

    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    item.quantity = quantity;
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await this.redisService.set(this.redisService.getCartKey(userId), cart);
    return cart;
  }
}
