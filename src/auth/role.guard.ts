import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Roles } from './roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get(Roles, context.getHandler());
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const { token } = request.cookies;

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_SECRET'),
        });

        payload.isAdmin = payload.role === 'admin';

        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        request['user'] = payload;
      } catch {
        throw new UnauthorizedException();
      }
    }

    if (roles) {
      if (!request['user']) {
        throw new UnauthorizedException();
      }

      return this.matchRoles(roles, request['user'].role);
    }

    return true;
  }

  private matchRoles(roles: string[], role: string): boolean {
    return roles.includes(role);
  }
}
