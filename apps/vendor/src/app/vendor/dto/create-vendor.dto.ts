import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVendorDto {
  @IsInt()
  userId: number;

  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsOptional()
  @IsString()
  storeDescription: string;
}
