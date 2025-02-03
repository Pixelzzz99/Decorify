import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { clientOptions } from '@sofa-web/common';
import { firstValueFrom, Observable } from 'rxjs';

interface InventoryServiceClient {
  syncWithProduct(data: { productId: number }): Observable<any>;
  updateStock(data: { productId: number; quantity: number }): Observable<any>;
  getProductStock(data: { productId: number }): Observable<any>;
}

@Injectable()
export class InventoryClient implements OnModuleInit {
  @Client(clientOptions.inventory)
  private readonly client: ClientGrpc;
  private inventoryService: InventoryServiceClient;

  onModuleInit() {
    this.inventoryService =
      this.client.getService<InventoryServiceClient>('InventoryService');
  }

  async syncWithProduct(productId: number) {
    const response = await firstValueFrom(
      this.inventoryService.syncWithProduct({ productId })
    );
    return response;
  }

  async updateStock(productId: number, quantity: number) {
    const response = await firstValueFrom(
      this.inventoryService.updateStock({ productId, quantity })
    );
    return response;
  }

  async getProductStock(productId: number) {
    const response = await firstValueFrom(
      this.inventoryService.getProductStock({ productId })
    );
    return response;
  }
}
