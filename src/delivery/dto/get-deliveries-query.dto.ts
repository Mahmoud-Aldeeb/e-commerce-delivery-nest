import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetDeliveriesQueryDto {
  @ApiPropertyOptional({
    example: 'active',
    description:
      '"active" (Assigned, Packed, Out for Delivery), "completed" (Delivered, Cancelled), or omit for all',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
