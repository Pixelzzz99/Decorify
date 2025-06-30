import {
  Controller,
  Inject,
  Post,
  Get,
  Put,
  Delete,
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
  CartServiceClient,
  CART_SERVICE_NAME,
  AddItemRequest,
  AddItemResponse,
  GetCartResponse,
  RemoveItemResponse,
  UpdateQuantityRequest,
  UpdateQuantityResponse,
  ClearCartResponse,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';

@Controller('cart')
export class CartController implements OnModuleInit {
  private svc: CartServiceClient;

  @Inject(CART_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<CartServiceClient>(CART_SERVICE_NAME);
  }

  @Get()
  @UseGuards(AuthGuard)
  private async getCart(
    @Req() req: Request
  ): Promise<Observable<GetCartResponse>> {
    const userId = req['user'] as string;
    return this.svc.getCart({ userId });
  }

  @Post('add')
  @UseGuards(AuthGuard)
  private async addItem(
    @Req() req: Request,
    @Body() body: Omit<AddItemRequest, 'userId'>
  ): Promise<Observable<AddItemResponse>> {
    const userId = req['user'] as string;
    return this.svc.addItem({ ...body, userId });
  }

  @Put('update')
  @UseGuards(AuthGuard)
  private async updateQuantity(
    @Req() req: Request,
    @Body() body: Omit<UpdateQuantityRequest, 'userId'>
  ): Promise<Observable<UpdateQuantityResponse>> {
    const userId = req['user'] as string;
    return this.svc.updateQuantity({ ...body, userId });
  }

  @Delete('remove/:productId')
  @UseGuards(AuthGuard)
  private async removeItem(
    @Req() req: Request,
    @Param('productId', ParseIntPipe) productId: number
  ): Promise<Observable<RemoveItemResponse>> {
    const userId = req['user'] as string;
    return this.svc.removeItem({ userId, productId });
  }

  @Delete('clear')
  @UseGuards(AuthGuard)
  private async clearCart(
    @Req() req: Request
  ): Promise<Observable<ClearCartResponse>> {
    const userId = req['user'] as string;
    return this.svc.clearCart({ userId });
  }
}
