import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetOrdersQueryDto {
  @ApiPropertyOptional({
    example: 'Placed',
    description: 'Filter by order status. Use "all" (or omit) for no filter',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
