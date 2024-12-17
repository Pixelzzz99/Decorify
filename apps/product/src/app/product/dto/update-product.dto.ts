import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto {
  productName?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  dimensions?: any;
  weight?: number;
  categoryIds?: number[];
  imageUrls?: string[];
}
