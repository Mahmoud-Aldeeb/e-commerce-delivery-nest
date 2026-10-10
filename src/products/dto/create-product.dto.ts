import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Fresh Tomatoes' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Locally grown, picked this morning' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 25.5, description: 'Current selling price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 30,
    description: 'Price before discount. Used to calculate the discount %',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/tomato.jpg',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({ example: 'vegetables' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: 'kg', description: 'Defaults to "piece"' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 100, description: 'Units in stock' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  reviewCount?: number;
}
