import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: any;

  async onModuleInit() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    await this.client.connect();
  }

  async hSet(key: string, field: string, value: string) {
    return await this.client.hSet(key, field, value);
  }

  async hGet(key: string, field: string) {
    return await this.client.hGet(key, field);
  }

  async hGetAll(key: string) {
    return await this.client.hGetAll(key);
  }

  async hDel(key: string, field: string) {
    return await this.client.hDel(key, field);
  }

  async hMSet(key: string, data: Record<string, string>) {
    return await this.client.hSet(key, data);
  }

  async expire(key: string, seconds: number) {
    return await this.client.expire(key, seconds);
  }

  async del(key: string) {
    return await this.client.del(key);
  }

  async get(key: string) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: unknown, ttl = 3600) {
    await this.client.set(key, JSON.stringify(value), { EX: ttl });
  }

  getCartKey(userId: string) {
    return `cart:${userId}`;
  }
}
