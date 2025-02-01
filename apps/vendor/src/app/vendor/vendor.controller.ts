import { Controller, Body, HttpStatus } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { GetVendorRequest, DeleteVendorRequest } from '@sofa-web/common';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { status } from '@grpc/grpc-js';

@Controller()
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @GrpcMethod('VendorService', 'CreateVendor')
  async createVendor(@Body() dto: CreateVendorDto) {
    try {
      return await this.vendorService.createVendor(dto);
      // return { status: HttpStatus.CREATED, data: result };
    } catch (error) {
      throw new RpcException({
        status: status.ABORTED,
        message: error.message,
      });
    }
  }

  @GrpcMethod('VendorService', 'GetVendor')
  async getVendor(@Body() data: GetVendorRequest) {
    try {
      return await this.vendorService.getVendorById(data.userId);
    } catch (error) {
      throw new RpcException({
        status: status.NOT_FOUND,
        message: error.message,
      });
    }
  }

  @GrpcMethod('VendorService', 'UpdateVendor')
  async updateVendor(@Body() data: UpdateVendorDto) {
    try {
      const result = await this.vendorService.updateVendor(data.userId, {
        storeName: data.storeName,
        storeDescription: data.storeDescription,
      });
      return { status: HttpStatus.OK, data: result };
    } catch (error) {
      throw new RpcException({
        status: status.ABORTED,
        message: error.message,
      });
    }
  }

  @GrpcMethod('VendorService', 'DeleteVendor')
  async deleteVendor(data: DeleteVendorRequest) {
    try {
      const result = await this.vendorService.deleteVendor(data.userId);
      return { status: HttpStatus.OK, data: result };
    } catch (error) {
      throw new RpcException({
        status: status.ABORTED,
        message: error.message,
      });
    }
  }
}
