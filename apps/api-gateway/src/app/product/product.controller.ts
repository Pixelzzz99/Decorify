import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  UseGuards,
  Post,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import {
  ProductServiceClient,
  PRODUCT_SERVICE_NAME,
  CreateProductResponse,
  GetProductByIdResponse,
  CreateProductRequest,
  GetProductsResponse,
  UpdateProductRequest,
  UpdateProductResponse,
} from '@sofa-web/common';
import { AuthGuard, SimpleAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, UserRole, CurrentUser, CurrentUserData } from '../auth/decorators';

// DTO для Swagger
class CreateProductDto {
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  weight: number;
  vendorId: number;
  categoryIds: number[];
  imageUrls: string[];
  dimensions?: Record<string, number>;
}

class UpdateProductDto {
  id: number;
  productName?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  weight?: number;
  categoryIds?: number[];
  imageUrls?: string[];
  dimensions?: Record<string, number>;
}

@ApiTags('products')
@Controller('product')
export class ProductController implements OnModuleInit {
  private svc: ProductServiceClient;

  @Inject(PRODUCT_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit() {
    this.svc =
      this.client.getService<ProductServiceClient>(PRODUCT_SERVICE_NAME);
  }

  @Post()
  @UseGuards(SimpleAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Создать новый товар',
    description: 'Создает новый товар в каталоге. Доступно только авторизованным поставщикам и администраторам.'
  })
  @ApiResponse({
    status: 201,
    description: 'Товар успешно создан',
  })
  @ApiUnauthorizedResponse({
    description: 'Необходима аутентификация',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав доступа',
  })
  @ApiBody({
    type: CreateProductDto,
    description: 'Данные нового товара',
    examples: {
      furniture: {
        summary: 'Мебель',
        value: {
          productName: 'Диван угловой "Комфорт"',
          description: 'Удобный угловой диван с раскладным механизмом',
          price: 45000,
          stockQuantity: 5,
          weight: 85.5,
          vendorId: 1,
          categoryIds: [1, 5],
          imageUrls: ['https://example.com/sofa1.jpg', 'https://example.com/sofa2.jpg'],
          dimensions: {
            length: 240,
            width: 160,
            height: 90
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Товар успешно создан',
    schema: {
      example: {
        status: 201,
        product: {
          id: 123,
          productName: 'Диван угловой "Комфорт"',
          price: 45000,
          stockQuantity: 5
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiBadRequestResponse({ description: 'Некорректные данные товара' })
  private async createProduct(
    @Body() body: CreateProductRequest,
    @CurrentUser() user: CurrentUserData
  ): Promise<Observable<CreateProductResponse>> {
    // Логируем создание продукта
    console.log(`User ${user.email} (${user.role}) creating product: ${body.productName}`);
    return this.svc.createProduct(body);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить товар по ID',
    description: 'Возвращает подробную информацию о товаре, включая изображения и категории'
  })
  @ApiParam({
    name: 'id',
    description: 'Уникальный идентификатор товара',
    example: 123,
    type: 'number'
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о товаре',
    schema: {
      example: {
        product: {
          id: 123,
          productName: 'Диван угловой "Комфорт"',
          description: 'Удобный угловой диван с раскладным механизмом',
          price: 45000,
          stockQuantity: 5,
          weight: 85.5,
          categories: [
            { id: 1, categoryName: 'Мебель' },
            { id: 5, categoryName: 'Диваны' }
          ],
          images: [
            { imageUrl: 'https://example.com/sofa1.jpg' },
            { imageUrl: 'https://example.com/sofa2.jpg' }
          ],
          vendor: {
            id: 1,
            storeName: 'Мебельная фабрика "Уют"'
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  // // @UseGuards(AuthGuard)
  private async getProductById(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Observable<GetProductByIdResponse>> {
    return this.svc.getProductById({ id });
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список товаров',
    description: 'Возвращает список товаров с пагинацией и фильтрацией'
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Количество товаров для пропуска (для пагинации)',
    example: 0
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Количество товаров для получения',
    example: 10
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Фильтр по категории',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Список товаров',
    schema: {
      example: {
        products: [
          {
            id: 123,
            productName: 'Диван угловой "Комфорт"',
            price: 45000,
            stockQuantity: 5,
            vendor: { storeName: 'Мебельная фабрика "Уют"' }
          }
        ],
        total: 1
      }
    }
  })
  // // @UseGuards(AuthGuard)
  private async getProducts(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('categoryId') categoryId?: number
  ): Promise<Observable<GetProductsResponse>> {
    // В реальной реализации categoryId должен использоваться для фильтрации
    const filters = categoryId ? { categoryId } : {};
    return this.svc.getProducts({ skip: skip || 0, take: take || 10, ...filters });
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Обновить товар',
    description: 'Обновляет информацию о товаре. Доступно только поставщикам и администраторам.'
  })
  @ApiParam({ name: 'id', description: 'ID товара для обновления' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Товар успешно обновлен' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  private async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductRequest,
    @CurrentUser() user: CurrentUserData
  ): Promise<Observable<UpdateProductResponse>> {
    console.log(`User ${user.email} (${user.role}) updating product ID: ${id}`);
    return this.svc.updateProduct({ ...body, id });
  }

  @Delete(':id')
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR, UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Удалить товар',
    description: 'Удаляет товар из каталога. Доступно только поставщикам и администраторам.'
  })
  @ApiParam({ name: 'id', description: 'ID товара для удаления' })
  @ApiResponse({ status: 200, description: 'Товар успешно удален' })
  @ApiNotFoundResponse({ description: 'Товар не найден' })
  @ApiUnauthorizedResponse({ description: 'Необходима аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав доступа' })
  private async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData
  ) {
    console.log(`User ${user.email} (${user.role}) deleting product ID: ${id}`);
    return this.svc.deleteProduct({ id });
  }
}
