import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  client: ReturnType<typeof createClient>;

  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL });
    this.client.on('error', (err) => console.log('Redis Client Error', err));
  }
  async onModuleInit() {
    await this.client.connect();
  }

  async get(key: string) {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any) {
    await this.client.set(key, JSON.stringify(value));
  }

  async del(key: string) {
    await this.client.del(key);
  }

  getCartKey(userId: string) {
    return `cart:${userId}`;
  }
}
