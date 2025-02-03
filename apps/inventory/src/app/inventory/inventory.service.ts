import { Injectable } from '@nestjs/common';
import { PrismaService } from '@sofa-web/prisma';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async updateStock(productId: number, quantity: number) {
    try {
      const inventory = await this.prisma.inventory.update({
        where: { productId },
        data: {
          quantity: {
            increment: quantity,
          },
        },
      });

      // Check if stock is low after update
      if (inventory.quantity <= inventory.lowStockThreshold) {
        await this.notifyLowStock(productId, inventory.quantity);
      }

      return inventory;
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to update inventory',
      });
    }
  }

  async notifyLowStock(productId: number, currentQuantity: number) {
    // TODO: Implement notification system (e.g., message queue)
    console.log(
      `Low stock alert for product ${productId}: ${currentQuantity} items remaining`
    );
  }

  async getProductStock(productId: number) {
    try {
      const inventory = await this.prisma.inventory.findUnique({
        where: { productId },
      });

      if (!inventory) {
        throw new RpcException({
          status: status.NOT_FOUND,
          message: 'Inventory not found',
        });
      }

      return inventory;
    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to get inventory',
      });
    }
  }

  async syncWithProduct(productId: number) {
    try {
      // Check if inventory exists
      const inventory = await this.prisma.inventory.findUnique({
        where: { productId },
      });

      if (!inventory) {
        // Create new inventory record if it doesn't exist
        return await this.prisma.inventory.create({
          data: {
            productId,
            quantity: 0,
            lowStockThreshold: 10, // Default threshold
          },
        });
      }

      return inventory;
    } catch (error) {
      throw new RpcException({
        status: status.INTERNAL,
        message: 'Failed to sync inventory with product',
      });
    }
  }
}
