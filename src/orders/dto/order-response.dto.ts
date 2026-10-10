import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty() product: string;
  @ApiProperty({ example: 'Fresh Tomatoes' }) name: string;
  @ApiProperty() image: string;
  @ApiProperty({ example: 25.5 }) price: number;
  @ApiProperty({ example: 2 }) quantity: number;
  @ApiPropertyOptional({ nullable: true, example: 'kg' }) unit: string | null;
}

export class PartnerSummaryDto {
  @ApiProperty({ example: 'Omar Hassan' }) name: string;
  @ApiProperty({ example: '01012345678' }) phone: string;
  @ApiPropertyOptional() email?: string;
  @ApiPropertyOptional() avatar?: string | null;
  @ApiPropertyOptional() vehicleType?: string | null;
}

export class UserSummaryDto {
  @ApiProperty() name: string;
  @ApiProperty() email: string;
}

export class OrderResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() userId: string;
  @ApiProperty({ type: [OrderItemResponseDto] }) items: OrderItemResponseDto[];
  @ApiProperty({ type: 'object', additionalProperties: true })
  shippingAddress: object;
  @ApiProperty({ example: 'card' }) paymentMethod: string;
  @ApiProperty({ example: 51 }) subtotal: number;
  @ApiPropertyOptional({ nullable: true, example: 0 }) deliveryFee:
    number | null;
  @ApiPropertyOptional({ nullable: true, example: 4.08 }) tax: number | null;
  @ApiProperty({ example: 55.08 }) total: number;
  @ApiProperty({ example: 'Placed' }) status: string;
  @ApiProperty({ type: 'array', items: { type: 'object' } })
  statusHistory: object[];
  @ApiPropertyOptional({ nullable: true }) deliveryPartnerId: string | null;
  @ApiPropertyOptional({ nullable: true }) deliveryOtp: string | null;
  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  liveLocation: object | null;
  @ApiPropertyOptional({ nullable: true }) isPaid: boolean | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiPropertyOptional({ type: PartnerSummaryDto, nullable: true })
  deliveryPartner?: PartnerSummaryDto | null;
  @ApiPropertyOptional({ type: UserSummaryDto }) user?: UserSummaryDto;
}

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] }) orders: OrderResponseDto[];
}

export class OrderItemResultDto {
  @ApiProperty({ type: OrderResponseDto }) order: OrderResponseDto;
}

export class CreateOrderResponseDto {
  @ApiPropertyOptional({
    type: OrderResponseDto,
    description: 'Returned when paymentMethod is not "card"',
  })
  order?: OrderResponseDto;

  @ApiPropertyOptional({
    description: 'Stripe Checkout URL, returned when paymentMethod is "card"',
  })
  url?: string | null;
}

export class OrderLocationResponseDto {
  @ApiPropertyOptional({
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  liveLocation: object | null;

  @ApiProperty({ example: 'Out for delivery' }) status: string;
}
