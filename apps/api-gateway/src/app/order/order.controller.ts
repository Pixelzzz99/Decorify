import {
  Controller,
  Inject,
  Post,
  Get,
  Param,
  OnModuleInit,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import {
  CreateOrderResponse,
  OrderServiceClient,
  ORDER_SERVICE_NAME,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// DTO классы для Swagger документации
class CreateOrderDto {
  @ApiProperty({
    description: 'ID товара',
    example: 1,
    minimum: 1
  })
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({
    description: 'Количество товара',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

class OrderResponseDto {
  @ApiProperty({ description: 'ID заказа', example: 12345 })
  id: number;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Статус заказа', example: 'pending' })
  status: string;

  @ApiProperty({ description: 'Общая стоимость', example: 30000 })
  totalAmount: number;

  @ApiProperty({ description: 'Дата создания', example: '2024-01-01T12:00:00.000Z' })
  createdAt: string;
}

@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@Controller('order')
export class OrderController implements OnModuleInit {
  private svc: OrderServiceClient;

  @Inject(ORDER_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<OrderServiceClient>(ORDER_SERVICE_NAME);
  }

  @Post()
  @ApiOperation({
    summary: 'Создать новый заказ',
    description: 'Создает новый заказ для пользователя на основе товаров в корзине или переданных данных'
  })
  @ApiBody({
    type: CreateOrderDto,
    description: 'Данные для создания заказа',
    examples: {
      order: {
        summary: 'Создание заказа',
        value: {
          productId: 1,
          quantity: 2
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Заказ успешно создан',
    type: OrderResponseDto,
    example: {
      id: 12345,
      userId: 1,
      status: 'pending',
      totalAmount: 30000,
      createdAt: '2024-01-01T12:00:00.000Z'
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  private async createOrder(
    @CurrentUser() userId: number,
    @Body() body: CreateOrderDto
  ): Promise<Observable<CreateOrderResponse>> {
    return this.svc.createOrder({ ...body, userId });
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({
    summary: 'Получить заказы пользователя',
    description: 'Возвращает список заказов текущего пользователя'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Фильтр по статусу заказа',
    example: 'pending'
  })
  @ApiResponse({
    status: 200,
    description: 'Список заказов успешно получен',
    schema: {
      type: 'object',
      properties: {
        orders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              status: { type: 'string', example: 'pending' },
              totalAmount: { type: 'number', example: 30000 },
              createdAt: { type: 'string', example: '2024-01-01T12:00:00.000Z' }
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  getUserOrders(
    @CurrentUser() userId: number,
    @Query('status') status?: string
  ): Observable<{ orders: Record<string, unknown>[] }> {
    // Заглушка для получения заказов пользователя
    // В реальной реализации нужно добавить соответствующий метод в gRPC сервис
    throw new Error(`Get user orders method not implemented in gRPC service for user: ${userId}, status: ${status || 'all'}`);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({
    summary: 'Получить заказ по ID',
    description: 'Возвращает детали конкретного заказа'
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор заказа',
    example: 1,
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Детали заказа успешно получены',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        status: { type: 'string', example: 'pending' },
        totalAmount: { type: 'number', example: 30000 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'number', example: 123 },
              quantity: { type: 'number', example: 2 },
              price: { type: 'number', example: 15000 }
            }
          }
        },
        createdAt: { type: 'string', example: '2024-01-01T12:00:00.000Z' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  @ApiNotFoundResponse({ description: 'Заказ не найден' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  getOrderById(
    @CurrentUser() userId: number,
    @Param('id') orderId: number
  ): Observable<Record<string, unknown>> {
    // Заглушка для получения заказа по ID
    // В реальной реализации нужно добавить соответствующий метод в gRPC сервис
    throw new Error(`Get order by ID method not implemented in gRPC service for user: ${userId}, order: ${orderId}`);
  }
}
