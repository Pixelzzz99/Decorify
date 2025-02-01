import { Controller, Body, NotFoundException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { status } from '@grpc/grpc-js';
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @GrpcMethod('CategoryService', 'GetCategories')
  async getCategories() {
    try {
      return await this.categoryService.getCategories();
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  @GrpcMethod('CategoryService', 'GetCategoryById')
  async getCategoryById(@Body() data: { id: number }) {
    try {
      return await this.categoryService.getCategoryById(data.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Category not found',
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  @GrpcMethod('CategoryService', 'CreateCategory')
  async createCategory(@Body() data: CreateCategoryDto) {
    try {
      return await this.categoryService.createCategory(data.categoryName);
    } catch (error) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  @GrpcMethod('CategoryService', 'UpdateCategory')
  async updateCategory(@Body() data: UpdateCategoryDto) {
    try {
      return await this.categoryService.updateCategory(
        data.id,
        data.categoryName
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Category not found',
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }

  @GrpcMethod('CategoryService', 'DeleteCategory')
  async deleteCategory(@Body() data: { id: number }) {
    try {
      return await this.categoryService.deleteCategory(data.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Category not found',
        });
      }
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Internal server error',
      });
    }
  }
}
