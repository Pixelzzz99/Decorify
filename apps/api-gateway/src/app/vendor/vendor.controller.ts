import {
  Controller,
  Inject,
  Post,
  Get,
  Put,
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
  ApiUnauthorizedResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsUrl } from 'class-validator';
import {
  VendorServiceClient,
  VENDOR_SERVICE_NAME,
  CreateVendorResponse,
  GetVendorByIdResponse,
  UpdateVendorResponse,
  GetVendorsResponse,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

// DTO классы для Swagger документации
class CreateVendorDto {
  @ApiProperty({
    description: 'Название магазина/поставщика',
    example: 'Мебельный Дом "Комфорт"',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @ApiProperty({
    description: 'Описание магазина',
    example: 'Качественная мебель для дома и офиса',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  storeDescription: string;

  @ApiProperty({
    description: 'Email для связи',
    example: 'info@comfort-furniture.ru',
    format: 'email'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Телефон для связи',
    example: '+7 (495) 123-45-67',
    minLength: 10,
    maxLength: 20
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Адрес магазина',
    example: 'г. Москва, ул. Мебельная, д. 15',
    minLength: 10,
    maxLength: 200
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Веб-сайт магазина',
    example: 'https://comfort-furniture.ru',
    required: false
  })
  @IsUrl()
  @IsOptional()
  website?: string;
}

class UpdateVendorDto {
  @ApiProperty({
    description: 'Название магазина/поставщика',
    example: 'Мебельный Дом "Комфорт Плюс"',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @ApiProperty({
    description: 'Описание магазина',
    example: 'Качественная мебель для дома и офиса с доставкой',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  storeDescription: string;

  @ApiProperty({
    description: 'Email для связи',
    example: 'info@comfort-furniture.ru',
    format: 'email',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Телефон для связи',
    example: '+7 (495) 123-45-67',
    minLength: 10,
    maxLength: 20,
    required: false
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Адрес магазина',
    example: 'г. Москва, ул. Мебельная, д. 15',
    minLength: 10,
    maxLength: 200,
    required: false
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Веб-сайт магазина',
    example: 'https://comfort-furniture.ru',
    required: false
  })
  @IsUrl()
  @IsOptional()
  website?: string;
}

class VendorResponseDto {
  @ApiProperty({ description: 'ID поставщика', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название магазина', example: 'Мебельный Дом "Комфорт"' })
  name: string;

  @ApiProperty({ description: 'Описание', example: 'Качественная мебель для дома и офиса' })
  description: string;

  @ApiProperty({ description: 'Email', example: 'info@comfort-furniture.ru' })
  email: string;

  @ApiProperty({ description: 'Телефон', example: '+7 (495) 123-45-67' })
  phone: string;

  @ApiProperty({ description: 'Адрес', example: 'г. Москва, ул. Мебельная, д. 15' })
  address: string;

  @ApiProperty({ description: 'Веб-сайт', example: 'https://comfort-furniture.ru', required: false })
  website?: string;

  @ApiProperty({ description: 'ID владельца', example: 1 })
  userId: number;

  @ApiProperty({ description: 'Дата создания', example: '2024-01-01T12:00:00.000Z' })
  createdAt: string;
}

@ApiTags('vendors')
@ApiBearerAuth('JWT-auth')
@Controller('vendor')
export class VendorController implements OnModuleInit {
  private svc: VendorServiceClient;

  @Inject(VENDOR_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit(): void {
    this.svc = this.client.getService<VendorServiceClient>(VENDOR_SERVICE_NAME);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Создать магазин поставщика',
    description: 'Создает новый магазин/профиль поставщика для текущего пользователя'
  })
  @ApiBody({
    type: CreateVendorDto,
    description: 'Данные для создания магазина',
    examples: {
      furniture: {
        summary: 'Мебельный магазин',
        value: {
          storeName: 'Мебельный Дом "Комфорт"',
          storeDescription: 'Качественная мебель для дома и офиса',
          email: 'info@comfort-furniture.ru',
          phone: '+7 (495) 123-45-67',
          address: 'г. Москва, ул. Мебельная, д. 15',
          website: 'https://comfort-furniture.ru'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Магазин успешно создан',
    type: VendorResponseDto,
    example: {
      id: 1,
      name: 'Мебельный Дом "Комфорт"',
      description: 'Качественная мебель для дома и офиса',
      email: 'info@comfort-furniture.ru',
      phone: '+7 (495) 123-45-67',
      address: 'г. Москва, ул. Мебельная, д. 15',
      website: 'https://comfort-furniture.ru',
      userId: 1,
      createdAt: '2024-01-01T12:00:00.000Z'
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async createVendor(
    @CurrentUser() user: { id: number; email: string; role: UserRole },
    @Body() body: CreateVendorDto
  ): Promise<Observable<CreateVendorResponse>> {
    return this.svc.createVendor({ ...body, userId: user.id });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить информацию о поставщике',
    description: 'Возвращает детальную информацию о поставщике по его идентификатору'
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор поставщика',
    example: 1,
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о поставщике успешно получена',
    type: VendorResponseDto,
    example: {
      id: 1,
      name: 'Мебельный Дом "Комфорт"',
      description: 'Качественная мебель для дома и офиса',
      email: 'info@comfort-furniture.ru',
      phone: '+7 (495) 123-45-67',
      address: 'г. Москва, ул. Мебельная, д. 15',
      website: 'https://comfort-furniture.ru',
      userId: 1,
      createdAt: '2024-01-01T12:00:00.000Z'
    }
  })
  @ApiNotFoundResponse({ description: 'Поставщик не найден' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async getVendorById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Observable<GetVendorByIdResponse>> {
    return this.svc.getVendorById({ id });
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список всех поставщиков',
    description: 'Возвращает список всех зарегистрированных поставщиков в системе'
  })
  @ApiResponse({
    status: 200,
    description: 'Список поставщиков успешно получен',
    schema: {
      type: 'object',
      properties: {
        vendors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Мебельный Дом "Комфорт"' },
              description: { type: 'string', example: 'Качественная мебель для дома и офиса' },
              email: { type: 'string', example: 'info@comfort-furniture.ru' },
              phone: { type: 'string', example: '+7 (495) 123-45-67' },
              address: { type: 'string', example: 'г. Москва, ул. Мебельная, д. 15' },
              website: { type: 'string', example: 'https://comfort-furniture.ru' },
              userId: { type: 'number', example: 1 },
              createdAt: { type: 'string', example: '2024-01-01T12:00:00.000Z' }
            }
          }
        }
      }
    }
  })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async getVendors(): Promise<Observable<GetVendorsResponse>> {
    return this.svc.getVendors({});
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Обновить информацию о поставщике',
    description: 'Обновляет информацию о существующем поставщике'
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор поставщика для обновления',
    example: 1,
    type: 'number'
  })
  @ApiBody({
    type: UpdateVendorDto,
    description: 'Данные для обновления поставщика',
    examples: {
      update: {
        summary: 'Обновление информации о магазине',
        value: {
          storeName: 'Мебельный Дом "Комфорт Плюс"',
          storeDescription: 'Качественная мебель для дома и офиса с доставкой',
          phone: '+7 (495) 123-45-68'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о поставщике успешно обновлена',
    type: VendorResponseDto,
    example: {
      id: 1,
      name: 'Мебельный Дом "Комфорт Плюс"',
      description: 'Качественная мебель для дома и офиса с доставкой',
      email: 'info@comfort-furniture.ru',
      phone: '+7 (495) 123-45-68',
      address: 'г. Москва, ул. Мебельная, д. 15',
      website: 'https://comfort-furniture.ru',
      userId: 1,
      createdAt: '2024-01-01T12:00:00.000Z'
    }
  })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  @ApiNotFoundResponse({ description: 'Поставщик не найден' })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  async updateVendor(
    @CurrentUser() user: { id: number; email: string; role: UserRole },
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateVendorDto
  ): Promise<Observable<UpdateVendorResponse>> {
    return this.svc.updateVendor({ ...body, id, userId: user.id });
  }
}
