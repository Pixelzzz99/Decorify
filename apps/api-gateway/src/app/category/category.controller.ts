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
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  CategoryServiceClient,
  CATEGORY_SERVICE_NAME,
  CreateCategoryRequest,
  CreateCategoryResponse,
  GetCategoriesResponse,
  GetCategoryByIdResponse,
  UpdateCategoryResponse,
} from '@sofa-web/common';

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
  createCategory(
    @Body() body: CreateCategoryRequest
  ): Observable<CreateCategoryResponse> {
    return this.svc.createCategory(body);
  }

  @Get()
  getCategories(): Observable<GetCategoriesResponse> {
    return this.svc.getCategories({});
  }

  @Get(':id')
  getCategoryById(
    @Param('id') id: number
  ): Observable<GetCategoryByIdResponse> {
    return this.svc.getCategoryById({ id });
  }

  @Put(':id')
  updateCategory(
    @Param('id') id: number,
    @Body('name') name: string
  ): Observable<UpdateCategoryResponse> {
    return this.svc.updateCategory({
      id,
      categoryName: name,
      parentCategoryId: 0,
    });
  }
}
