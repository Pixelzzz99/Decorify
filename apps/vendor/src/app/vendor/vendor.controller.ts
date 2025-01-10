import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Controller()
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @GrpcMethod('VendorService', 'CreateVendor')
  async createVendor(dto: CreateVendorDto) {
    return this.vendorService.createVendor(dto);
  }

  @GrpcMethod('VendorService', 'GetVendorById')
  async getVendorById(data: { vendorId: number }) {
    return this.vendorService.getVendorById(data.vendorId);
  }

  @GrpcMethod('VendorService', 'UpdateVendor')
  async updateVendor(data: {
    vendorId: number;
    storeName?: string;
    storeDescription?: string;
  }) {
    return this.vendorService.updateVendor(data.vendorId, {
      storeName: data.storeName,
      storeDescription: data.storeDescription,
    });
  }

  @GrpcMethod('VendorService', 'DeleteVendor')
  async deleteVendor(data: { vendorId: number }) {
    return this.vendorService.deleteVendor(data.vendorId);
  }
}
