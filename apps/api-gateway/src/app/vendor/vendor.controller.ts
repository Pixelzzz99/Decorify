import {
  Controller,
  Inject,
  Post,
  Get,
  Put,
  OnModuleInit,
  UseGuards,
  Req,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  VendorServiceClient,
  VENDOR_SERVICE_NAME,
  CreateVendorRequest,
  CreateVendorResponse,
  GetVendorByIdResponse,
  UpdateVendorRequest,
  UpdateVendorResponse,
  GetVendorsResponse,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';

@Controller('vendor')
export class VendorController implements OnModuleInit {
  private svc: VendorServiceClient;

  @Inject(VENDOR_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<VendorServiceClient>(VENDOR_SERVICE_NAME);
  }

  @Post()
  @UseGuards(AuthGuard)
  private async createVendor(
    @Req() req: Request,
    @Body() body: Omit<CreateVendorRequest, 'userId'>
  ): Promise<Observable<CreateVendorResponse>> {
    const userId = req['user'] as number;
    return this.svc.createVendor({ ...body, userId });
  }

  @Get(':id')
  private async getVendorById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Observable<GetVendorByIdResponse>> {
    return this.svc.getVendorById({ id });
  }

  @Get()
  private async getVendors(): Promise<Observable<GetVendorsResponse>> {
    return this.svc.getVendors({});
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  private async updateVendor(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Omit<UpdateVendorRequest, 'id'>
  ): Promise<Observable<UpdateVendorResponse>> {
    return this.svc.updateVendor({ ...body, id });
  }
}
