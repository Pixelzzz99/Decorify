export class CreateProductDto {
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  dimensions?: any;
  weight: number;
  vendorId: number;
  categoryIds: number[];
  imageUrls: string[];
}
