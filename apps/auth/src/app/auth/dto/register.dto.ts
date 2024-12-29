import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterRequestDto {
  @IsString()
  @MinLength(3)
  public readonly name: string;

  @IsEmail()
  public readonly email: string;

  @IsString()
  @MinLength(6)
  public readonly password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role = Role.CUSTOMER;
}
