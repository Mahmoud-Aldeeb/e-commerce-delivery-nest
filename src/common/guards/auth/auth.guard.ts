import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'No token provided, authorization denied',
      );
    }

    const token = authHeader.split(' ')[1];

    let decoded: { id: string; role?: string };

    try {
      decoded = this.jwtService.verify<{ id: string; role?: string }>(token);
    } catch {
      throw new UnauthorizedException('Token is not valid');
    }
    // Delivery partner tokens are only valid on DeliveryAuthGuard routes
    if (decoded.role === 'delivery') {
      throw new ForbiddenException('Access denied');
    }

    req.user = { id: decoded.id };
    return true;
  }
}
