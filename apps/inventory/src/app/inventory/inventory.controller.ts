import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import { status } from '@grpc/grpc-js';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @GrpcMethod('InventoryService', 'UpdateStock')
  async updateStock(data: { productId: number; quantity: number }) {
    try {
      const result = await this.inventoryService.updateStock(
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

  @GrpcMethod('InventoryService', 'GetProductStock')
  async getProductStock(data: { productId: number }) {
    try {
      const result = await this.inventoryService.getProductStock(
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

  @GrpcMethod('InventoryService', 'SyncWithProduct')
  async syncWithProduct(data: { productId: number }) {
    try {
      const result = await this.inventoryService.syncWithProduct(
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
}
