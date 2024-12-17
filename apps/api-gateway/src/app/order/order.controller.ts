import {
  Controller,
  Inject,
  Post,
  OnModuleInit,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  CreateOrderResponse,
  CreateOrderRequest,
  OrderServiceClient,
  ORDER_SERVICE_NAME,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';

@Controller('order')
export class OrderController implements OnModuleInit {
  private svc: OrderServiceClient;

  @Inject(ORDER_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<OrderServiceClient>(ORDER_SERVICE_NAME);
  }

  @Post()
  @UseGuards(AuthGuard)
  private async createOrder(
    @Req() req: Request
  ): Promise<Observable<CreateOrderResponse>> {
    const body: CreateOrderRequest = req.body;

    body.userId = <number>req['user'];
    return this.svc.createOrder(body);
  }
}
