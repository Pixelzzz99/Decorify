import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { RedisService } from './redis.service';
import { firstValueFrom } from 'rxjs';
import { Product } from '@prisma/client';
import { PrismaService } from '@sofa-web/prisma';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

interface CatalogService {
  getProduct(data: { id: string }): Promise<any>;
}

@Injectable()
export class CartService implements OnModuleInit {
  private catalogService: CatalogService;
  private readonly CART_EXPIRY = 60 * 60 * 24 * 7; // 7 days

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

  async addToCart(userId: number, productId: number, quantity: number) {
    try {
      const cartKey = `cart:${userId}`;
      const product = await this.prismaService.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new RpcException({
          status: status.NOT_FOUND,
          message: 'Product not found',
        });
      }

      const cartItem = {
        productId,
        quantity,
        price: product.price,
        totalPrice: product.price * quantity,
      };

      await this.redisService.hSet(
        cartKey,
        productId.toString(),
        JSON.stringify(cartItem)
      );
      await this.redisService.expire(cartKey, this.CART_EXPIRY);

      return await this.getCart(userId.toString());
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to add item to cart',
      });
    }
  }

  async removeFromCart(userId: number, productId: number) {
    try {
      const cartKey = `cart:${userId}`;
      await this.redisService.hDel(cartKey, productId.toString());
      return await this.getCart(userId.toString());
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to remove item from cart',
      });
    }
  }

  async updateCartItem(userId: number, productId: number, quantity: number) {
    try {
      const cartKey = `cart:${userId}`;
      const itemStr = await this.redisService.hGet(
        cartKey,
        productId.toString()
      );

      if (!itemStr) {
        throw new RpcException({
          status: status.NOT_FOUND,
          message: 'Item not found in cart',
        });
      }

      const item = JSON.parse(itemStr);
      item.quantity = quantity;
      item.totalPrice = item.price * quantity;

      await this.redisService.hSet(
        cartKey,
        productId.toString(),
        JSON.stringify(item)
      );
      return await this.getCart(userId.toString());
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to update cart item',
      });
    }
  }

  async clearCart(userId: number) {
    try {
      const cartKey = `cart:${userId}`;
      await this.redisService.del(cartKey);
      return { success: true };
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to clear cart',
      });
    }
  }

  async syncCart(userId: number, deviceId: string) {
    try {
      const userCartKey = `cart:${userId}`;
      const deviceCartKey = `cart:device:${deviceId}`;

      // Merge device cart into user cart
      const deviceCart = await this.redisService.hGetAll(deviceCartKey);
      if (Object.keys(deviceCart).length > 0) {
        await this.redisService.hMSet(userCartKey, deviceCart);
        await this.redisService.del(deviceCartKey);
      }

      return await this.getCart(userId.toString());
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to sync cart',
      });
    }
  }
}
