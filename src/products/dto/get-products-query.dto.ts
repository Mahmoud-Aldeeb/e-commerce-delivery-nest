import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetProductsQueryDto {
  @ApiPropertyOptional({
    example: 'vegetables',
    description: 'Filter by category. Use "all" (or omit) for no filter',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'tom',
    description: 'Case-insensitive search in the product name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 10, description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'minPrice must be a number' })
  minPrice?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'maxPrice must be a number' })
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 'price-low',
    description: '"price-low", "price-high", or anything else for newest first',
  })
  @IsOptional()
  @IsString()
  sort?: string;
}
