import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../generated/prisma/enums';

export class UserResponseDto {
  @ApiProperty({ example: 'clx1abc...' })
  id: string;

  @ApiProperty({ example: 'Ahmed Ali' })
  name: string;

  @ApiProperty({ example: 'ahmed@example.com' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({
    example: false,
    description: 'True when the user role is ADMIN',
  })
  isAdmin: boolean;

  @ApiPropertyOptional({ example: '01012345678', nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  avatar: string | null;

  @ApiPropertyOptional({
    description: 'User addresses (returned by login only)',
    type: 'array',
    items: { type: 'object' },
  })
  addresses?: object[];
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
    description: 'JWT token, valid for 30 days',
  })
  token: string;
}
