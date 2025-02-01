import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @GrpcMethod('ProductService', 'CreateProduct')
  async createProduct(data: CreateProductDto) {
    return {
      product: await this.productService.createProduct(data),
    };
  }

  @GrpcMethod('ProductService', 'GetProducts')
  async getAllProducts(data: { skip?: number; take?: number }) {
    const products = await this.productService.getProducts(
      data.skip,
      data.take
    );
    return { products };
  }

  @GrpcMethod('ProductService', 'GetOneProduct')
  async getOneProduct(data: { id: number }) {
    const product = await this.productService.getProduct(data.id);
    return { product };
  }

  @GrpcMethod('ProductService', 'UpdateProduct')
  async updateProduct(data: {
    id: number;
    updateProductDto: UpdateProductDto;
  }) {
    const product = await this.productService.updateProduct(
      data.id,
      data.updateProductDto
    );
    return { product };
  }

  @GrpcMethod('ProductService', 'DeleteProduct')
  async deleteProduct(data: { id: number }) {
    const product = await this.productService.deleteProduct(data.id);
    return { product };
  }
}
