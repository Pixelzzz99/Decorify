import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { RedisService } from './redis.service';
import { firstValueFrom } from 'rxjs';
import { Product } from '@prisma/client';
import { PrismaService } from '@sofa-web/prisma';

interface CatalogService {
  getProduct(data: { id: string }): Promise<any>;
}

@Injectable()
export class CartService implements OnModuleInit {
  private catalogService: CatalogService;

  constructor(
    @Inject('CATALOG_SERVICE') private client: ClientGrpc,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService
  ) {}

  onModuleInit() {
    this.catalogService =
      this.client.getService<CatalogService>('CatalogService');
  }

  async getCart(userId: string) {
    const cartKey = this.redisService.getCartKey(userId);
    let cart = await this.redisService.get(cartKey);
    if (!cart) {
      cart = await this.loadCartFromDb(userId);
    }
    return cart || { userId, items: [], total: 0 };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    try {
      const product = await firstValueFrom<Product>(
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

      cart.total = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      const cartKey = this.redisService.getCartKey(userId);
      await this.redisService.set(cartKey, cart);
    } catch (error) {
      console.log(error.message);
      throw new Error('Product not found');
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

  async clearCart(userId: string) {
    await this.redisService.del(this.redisService.getCartKey(userId));
  }

  async persistCartToDb(userId: string) {
    const cart = await this.getCart(userId);

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty or does not exist');
    }

    await this.prismaService.shoppingCart.upsert({
      where: { userId: +userId },
      update: {
        CartItems: {
          deleteMany: {},
          create: cart.items.map((item) => ({
            productId: +item.productId,
            quantity: item.quantity,
          })),
        },
      },
      create: {
        userId: +userId,
        CartItems: {
          create: cart.items.map((item) => ({
            productId: +item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });
  }

  async loadCartFromDb(userId: string) {
    const cart = await this.prismaService.shoppingCart.findUnique({
      where: { userId: +userId },
      include: {
        CartItems: {
          include: {
            Product: true,
          },
        },
      },
    });

    if (!cart) {
      return { userId, items: [], total: 0 };
    }

    const redisCart = {
      userId,
      items: cart.CartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.Product.price || 0,
      })),
      total: cart.CartItems.reduce(
        (total, item) => total + item.Product.price * item.quantity,
        0
      ),
    };

    const cartKey = this.redisService.getCartKey(userId);
    await this.redisService.set(cartKey, redisCart);
    return redisCart;
  }
}
