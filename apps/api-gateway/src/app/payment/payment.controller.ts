import {
  Controller,
  Inject,
  Post,
  Get,
  OnModuleInit,
  UseGuards,
  Param,
  Body,
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
  ApiUnauthorizedResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import {
  PaymentServiceClient,
  PAYMENT_SERVICE_NAME,
  ProcessPaymentResponse,
  GetPaymentStatusResponse,
  RefundPaymentResponse,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// DTO классы для Swagger документации
enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer'
}

class ProcessPaymentDto {
  @ApiProperty({
    description: 'ID заказа для оплаты',
    example: '12345',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    description: 'Сумма к оплате',
    example: 30000,
    minimum: 0.01
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Способ оплаты',
    enum: PaymentMethod,
    example: PaymentMethod.CARD
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Валюта',
    example: 'RUB',
    default: 'RUB'
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'Дополнительная информация об оплате',
    example: 'Оплата заказа #12345',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Токен карты для оплаты',
    example: 'card_token_12345',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  cardToken: string;
}

class RefundPaymentDto {
  @ApiProperty({
    description: 'ID платежа для возврата',
    example: 'pay_12345',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @ApiProperty({
    description: 'Сумма возврата',
    example: 15000,
    minimum: 0.01
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Причина возврата',
    example: 'Товар не подошел покупателю',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

class PaymentResponseDto {
  @ApiProperty({ description: 'ID платежа', example: 'pay_12345' })
  paymentId: string;

  @ApiProperty({ description: 'Статус платежа', example: 'success' })
  status: string;

  @ApiProperty({ description: 'Сумма платежа', example: 30000 })
  amount: number;

  @ApiProperty({ description: 'URL для переадресации (если требуется)', example: 'https://payment.example.com/redirect', required: false })
  redirectUrl?: string;
}

@ApiTags('payments')
@ApiBearerAuth('JWT-auth')
@Controller('payment')
export class PaymentController implements OnModuleInit {
  private svc: PaymentServiceClient;

  @Inject(PAYMENT_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<PaymentServiceClient>(PAYMENT_SERVICE_NAME);
  }

  @Post('process')
  @ApiOperation({
    summary: 'Обработать платеж',
    description: 'Инициирует процесс оплаты заказа через выбранный способ оплаты'
  })
  @ApiBody({
    type: ProcessPaymentDto,
    description: 'Данные для обработки платежа',
    examples: {
      card: {
        summary: 'Оплата картой',
        value: {
          orderId: 12345,
          amount: 30000,
          paymentMethod: 'card',
          currency: 'RUB',
          description: 'Оплата заказа #12345'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Платеж успешно инициирован',
    type: PaymentResponseDto,
    example: {
      paymentId: 'pay_12345',
      status: 'pending',
      amount: 30000,
      redirectUrl: 'https://payment.example.com/redirect'
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiInternalServerErrorResponse({ description: 'Ошибка при обработке платежа' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  private async processPayment(
    @CurrentUser() userId: number,
    @Body() body: ProcessPaymentDto
  ): Promise<Observable<ProcessPaymentResponse>> {
    return this.svc.processPayment(body);
  }

  @Get('status/:paymentId')
  @ApiOperation({
    summary: 'Получить статус платежа',
    description: 'Возвращает текущий статус платежа по его идентификатору'
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Идентификатор платежа',
    example: 'pay_12345',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Статус платежа успешно получен',
    schema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', example: 'pay_12345' },
        status: { type: 'string', example: 'success' },
        amount: { type: 'number', example: 30000 },
        orderId: { type: 'string', example: '12345' },
        createdAt: { type: 'string', example: '2024-01-01T12:00:00.000Z' },
        updatedAt: { type: 'string', example: '2024-01-01T12:05:00.000Z' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  @ApiNotFoundResponse({ description: 'Платеж не найден' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  private async getPaymentStatus(
    @CurrentUser() userId: number,
    @Param('paymentId') paymentId: string
  ): Promise<Observable<GetPaymentStatusResponse>> {
    return this.svc.getPaymentStatus({ paymentId });
  }

  @Post('refund')
  @ApiOperation({
    summary: 'Возврат платежа',
    description: 'Инициирует возврат средств по ранее совершенному платежу'
  })
  @ApiBody({
    type: RefundPaymentDto,
    description: 'Данные для возврата платежа',
    examples: {
      partial: {
        summary: 'Частичный возврат',
        value: {
          paymentId: 'pay_12345',
          amount: 15000,
          reason: 'Частичный возврат по требованию клиента'
        }
      },
      full: {
        summary: 'Полный возврат',
        value: {
          paymentId: 'pay_12345',
          reason: 'Товар не подошел покупателю'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Возврат успешно инициирован',
    schema: {
      type: 'object',
      properties: {
        refundId: { type: 'string', example: 'refund_12345' },
        status: { type: 'string', example: 'pending' },
        amount: { type: 'number', example: 15000 },
        paymentId: { type: 'string', example: 'pay_12345' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiNotFoundResponse({ description: 'Платеж не найден' })
  @ApiInternalServerErrorResponse({ description: 'Ошибка при обработке возврата' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  private async refundPayment(
    @CurrentUser() userId: number,
    @Body() body: RefundPaymentDto
  ): Promise<Observable<RefundPaymentResponse>> {
    return this.svc.refundPayment(body);
  }
}
