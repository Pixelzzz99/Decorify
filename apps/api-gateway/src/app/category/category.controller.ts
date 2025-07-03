import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Inject,
  OnModuleInit,
  UseGuards,
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
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import {
  CategoryServiceClient,
  CATEGORY_SERVICE_NAME,
  CreateCategoryResponse,
  GetCategoriesResponse,
  GetCategoryByIdResponse,
  UpdateCategoryResponse,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

// DTO классы для Swagger документации
class CreateCategoryDto {
  @ApiProperty({
    description: 'Название категории',
    example: 'Диваны и кресла',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @ApiProperty({
    description: 'ID родительской категории (0 для корневой категории)',
    example: 0,
    minimum: 0
  })
  @IsNumber()
  parentCategoryId: number;
}

class UpdateCategoryDto {
  @ApiProperty({
    description: 'Новое название категории',
    example: 'Мягкая мебель',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}

class CategoryResponseDto {
  @ApiProperty({ description: 'ID категории', example: 1 })
  id: number;

  @ApiProperty({ description: 'Название категории', example: 'Диваны и кресла' })
  categoryName: string;

  @ApiProperty({ description: 'ID родительской категории', example: 0 })
  parentCategoryId: number;
}

@ApiTags('categories')
@ApiBearerAuth('JWT-auth')
@Controller('category')
export class CategoryController implements OnModuleInit {
  private svc: CategoryServiceClient;

  @Inject(CATEGORY_SERVICE_NAME)
  private readonly client: ClientGrpc;

  onModuleInit() {
    this.svc = this.client.getService<CategoryServiceClient>(
      CATEGORY_SERVICE_NAME
    );
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Создать новую категорию',
    description: 'Создает новую категорию товаров в системе. Требуется роль ADMIN.'
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Данные для создания категории',
    examples: {
      furniture: {
        summary: 'Создание категории мебели',
        value: {
          categoryName: 'Диваны и кресла',
          parentCategoryId: 0
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Категория успешно создана',
    type: CategoryResponseDto,
    example: {
      id: 1,
      categoryName: 'Диваны и кресла',
      parentCategoryId: 0
    }
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа. Требуется роль ADMIN.' })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  createCategory(
    @Body() body: CreateCategoryDto
  ): Observable<CreateCategoryResponse> {
    return this.svc.createCategory(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все категории',
    description: 'Возвращает список всех доступных категорий товаров'
  })
  @ApiResponse({
    status: 200,
    description: 'Список категорий успешно получен',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              categoryName: { type: 'string', example: 'Диваны и кресла' },
              parentCategoryId: { type: 'number', example: 0 }
            }
          }
        }
      }
    }
  })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  getCategories(): Observable<GetCategoriesResponse> {
    return this.svc.getCategories({});
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить категорию по ID',
    description: 'Возвращает информацию о конкретной категории по её идентификатору'
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор категории',
    example: 1,
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о категории успешно получена',
    type: CategoryResponseDto,
    example: {
      id: 1,
      categoryName: 'Диваны и кресла',
      parentCategoryId: 0
    }
  })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  getCategoryById(
    @Param('id') id: number
  ): Observable<GetCategoryByIdResponse> {
    return this.svc.getCategoryById({ id });
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Обновить категорию',
    description: 'Обновляет информацию о существующей категории. Требуется роль ADMIN.'
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор категории для обновления',
    example: 1,
    type: 'number'
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Новые данные категории',
    examples: {
      update: {
        summary: 'Обновление названия категории',
        value: {
          name: 'Мягкая мебель'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно обновлена',
    type: CategoryResponseDto,
    example: {
      id: 1,
      categoryName: 'Мягкая мебель',
      parentCategoryId: 0
    }
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа. Требуется роль ADMIN.' })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiBadRequestResponse({ description: 'Некорректные данные запроса' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  updateCategory(
    @Param('id') id: number,
    @Body() body: UpdateCategoryDto
  ): Observable<UpdateCategoryResponse> {
    return this.svc.updateCategory({
      id,
      categoryName: body.name,
      parentCategoryId: 0,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Удалить категорию',
    description: 'Удаляет категорию из системы. Требуется роль ADMIN.'
  })
  @ApiParam({
    name: 'id',
    description: 'Идентификатор категории для удаления',
    example: 1,
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно удалена',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Категория успешно удалена' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Пользователь не авторизован' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа. Требуется роль ADMIN.' })
  @ApiNotFoundResponse({ description: 'Категория не найдена' })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  deleteCategory(@Param('id') id: number): Observable<{ success: boolean; message: string }> {
    // Заглушка для удаления категории, так как в protobuf может не быть метода deleteCategory
    // В реальной реализации нужно добавить соответствующий метод в gRPC сервис
    throw new Error(`Delete category method not implemented in gRPC service for category ID: ${id}`);
  }
}
