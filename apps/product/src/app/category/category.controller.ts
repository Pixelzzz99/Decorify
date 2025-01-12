import { Controller, Param, Body } from '@nestjs/common';
import { CategoryService } from './category.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @GrpcMethod('CategoryService', 'GetCategories')
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @GrpcMethod('CategoryService', 'GetCategoryById')
  async getCategoryById(@Param('id') id: number) {
    return this.categoryService.getCategoryById(id);
  }

  @GrpcMethod('CategoryService', 'CreateCategory')
  async createCategory(@Body('name') name: string) {
    return this.categoryService.createCategory(name);
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  async updateCategory(@Param('id') id: number, @Body('name') name: string) {
    return this.categoryService.updateCategory(id, name);
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  async deleteCategory(@Param('id') id: number) {
    return this.categoryService.deleteCategory(id);
  }
}
