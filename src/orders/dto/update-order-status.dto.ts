import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'Out for delivery' })
  @IsString({ message: 'Status is required' })
  @IsNotEmpty({ message: 'Status is required' })
  status: string;

  @ApiPropertyOptional({
    example: 'Driver picked up the order',
    description: 'Defaults to "Order <status in lowercase>"',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
