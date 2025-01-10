import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async getCategories() {
    return this.categoryService.getCategories();
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: number) {
    return this.categoryService.getCategoryById(id);
  }

  @Post()
  async createCategory(@Body('name') name: string) {
    return this.categoryService.createCategory(name);
  }

  @Put(':id')
  async updateCategory(@Param('id') id: number, @Body('name') name: string) {
    return this.categoryService.updateCategory(id, name);
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: number) {
    return this.categoryService.deleteCategory(id);
  }
}
