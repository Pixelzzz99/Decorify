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
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  ProductServiceClient,
  PRODUCT_SERVICE_NAME,
  CreateProductResponse,
  GetProductByIdResponse,
  CreateProducRequest,
  GetProductsResponse,
  UpdateProductRequest,
  UpdateProductResponse,
} from '@sofa-web/common';
import { AuthGuard } from '../auth/guards/auth.guard';

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
  // @UseGuards(AuthGuard)
  private async createProduct(
    @Body() body: CreateProducRequest
  ): Promise<Observable<CreateProductResponse>> {
    // return null;
    return this.svc.createProduct(body);
  }

  @Get(':id')
  // @UseGuards(AuthGuard)
  private async findOneProduct(
    @Param('id', ParseIntPipe) id: number
  ): Promise<Observable<GetProductByIdResponse>> {
    return this.svc.getProductById({ id });
  }

  @Get()
  // @UseGuards(AuthGuard)
  private async findAllProducts(): Promise<Observable<GetProductsResponse>> {
    return this.svc.getProducts(null);
  }

  @Put(':id')
  private async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductRequest
  ): Promise<Observable<UpdateProductResponse>> {
    return this.svc.updateProduct({ id, ...body });
  }

  @Delete(':id')
  private async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.svc.deleteProduct({ id });
  }
}
