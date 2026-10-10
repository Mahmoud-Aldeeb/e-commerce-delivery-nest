import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @ApiProperty({
    description: 'Product id',
    example: '3f2a9c1e-0b7d-4d6e-9a41-5c8e2b7f1a10',
  })
  @IsString({ message: 'Invalid order item' })
  @IsNotEmpty({ message: 'Invalid order item' })
  product: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt({ message: 'Quantity must be a whole number' })
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray({ message: 'No order items' })
  @ArrayNotEmpty({ message: 'No order items' })
  // Validate every element, and turn plain objects into OrderItemDto instances
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Delivery address, stored as-is in the order',
    example: {
      address: '12 Main St',
      city: 'Cairo',
      state: 'Cairo',
      zip: '11511',
    },
  })
  @IsObject({ message: 'Shipping address is required' })
  shippingAddress: Record<string, any>;

  @ApiProperty({
    example: 'card',
    description:
      '"card" starts a Stripe checkout; any other value places the order directly',
  })
  @IsString({ message: 'Payment method is required' })
  @IsNotEmpty({ message: 'Payment method is required' })
  paymentMethod: string;
}
