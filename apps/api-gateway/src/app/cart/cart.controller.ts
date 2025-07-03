import {
  Controller,
  Inject,
  Post,
  Get,
  Put,
  Delete,
  OnModuleInit,
  UseGuards,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiProperty,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import {
  CartServiceClient,
  CART_SERVICE_NAME,
  AddItemResponse,
  GetCartResponse,
  RemoveItemResponse,
  UpdateQuantityResponse,
  ClearCartResponse,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/decorators/roles.decorator';

// DTO классы для Swagger документации
class AddItemDto {
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
  @Min(1)
  quantity: number;
}

class UpdateQuantityDto {
  @ApiProperty({
    description: 'ID товара',
    example: '1',
    type: 'string'
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Новое количество товара',
    example: 3,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

class CartItemDto {
  @ApiProperty({ description: 'ID товара', example: 1 })
  productId: number;

  @ApiProperty({ description: 'Количество', example: 2 })
  quantity: number;

  @ApiProperty({ description: 'Цена за единицу', example: 15000 })
  price: number;
}

class CartResponseDto {
  @ApiProperty({ description: 'ID пользователя', example: 'user123' })
  userId: string;

  @ApiProperty({ description: 'Товары в корзине', type: [CartItemDto] })
  items: CartItemDto[];

  @ApiProperty({ description: 'Общая стоимость', example: 30000 })
  totalPrice: number;
}

@ApiTags('cart')
@ApiBearerAuth('JWT-auth')
@Controller('cart')
export class CartController implements OnModuleInit {
  private svc: CartServiceClient;

  @Inject(CART_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<CartServiceClient>(CART_SERVICE_NAME);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить корзину пользователя',
    description: 'Возвращает содержимое корзины текущего пользователя'
  })
  @ApiResponse({
    status: 200,
    description: 'Корзина успешно получена',
    type: CartResponseDto,
    example: {
      userId: 'user123',
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 15000
        }
      ],
      totalPrice: 30000
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  private async getCart(
    @CurrentUser() user: { id: number; email: string; role: string }
  ): Promise<Observable<GetCartResponse>> {
    return this.svc.getCart({ userId: user.id.toString() });
  }

  @Post('add')
  @ApiOperation({
    summary: 'Добавить товар в корзину',
    description: 'Добавляет товар в корзину пользователя или увеличивает количество, если товар уже есть'
  })
  @ApiBody({
    type: AddItemDto,
    description: 'Данные товара для добавления',
    examples: {
      add: {
        summary: 'Добавление товара',
        value: {
          productId: 1,
          quantity: 2
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Товар успешно добавлен в корзину',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Товар добавлен в корзину' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  private async addItem(
    @CurrentUser() user: { id: number; email: string; role: string },
    @Body() body: AddItemDto
  ): Promise<Observable<AddItemResponse>> {
    return this.svc.addItem({ ...body, userId: user.id.toString() });
  }

  @Put('update')
  @ApiOperation({
    summary: 'Обновить количество товара в корзине',
    description: 'Изменяет количество определенного товара в корзине пользователя'
  })
  @ApiBody({
    type: UpdateQuantityDto,
    description: 'Данные для обновления количества',
    examples: {
      update: {
        summary: 'Обновление количества',
        value: {
          productId: 1,
          quantity: 3
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Количество товара успешно обновлено',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Количество товара обновлено' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiNotFoundResponse({ description: 'Товар не найден в корзине' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  private async updateQuantity(
    @CurrentUser() user: { id: number; email: string; role: string },
    @Body() body: UpdateQuantityDto
  ): Promise<Observable<UpdateQuantityResponse>> {
    return this.svc.updateQuantity({ ...body, userId: user.id.toString() });
  }

  @Delete('remove/:productId')
  @ApiOperation({
    summary: 'Удалить товар из корзины',
    description: 'Полностью удаляет товар из корзины пользователя'
  })
  @ApiParam({
    name: 'productId',
    description: 'Идентификатор товара для удаления',
    example: 1,
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Товар успешно удален из корзины',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Товар удален из корзины' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiNotFoundResponse({ description: 'Товар не найден в корзине' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  private async removeItem(
    @CurrentUser() user: { id: number; email: string; role: string },
    @Param('productId', ParseIntPipe) productId: number
  ): Promise<Observable<RemoveItemResponse>> {
    return this.svc.removeItem({ userId: user.id.toString(), productId });
  }

  @Delete('clear')
  @ApiOperation({
    summary: 'Очистить корзину',
    description: 'Удаляет все товары из корзины пользователя'
  })
  @ApiResponse({
    status: 200,
    description: 'Корзина успешно очищена',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Корзина очищена' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  private async clearCart(
    @CurrentUser() user: { id: number; email: string; role: string }
  ): Promise<Observable<ClearCartResponse>> {
    return this.svc.clearCart({ userId: user.id.toString() });
  }
}
