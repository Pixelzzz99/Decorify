import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  HttpStatus,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { Request } from 'express';
import { AUTH_SERVICE_NAME, ValidateTokenResponse } from '@sofa-web/common';
import { ClientGrpc } from '@nestjs/microservices';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private authService: any;

  constructor(@Inject(AUTH_SERVICE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService(AUTH_SERVICE_NAME);
  }

  private extractTokenFromHeader(request: AuthenticatedRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  public async canActivate(
    context: ExecutionContext
  ): Promise<boolean> | never {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is required');
    }

    try {
      const { status, userId }: ValidateTokenResponse =
        await this.authService.validate({ token });

      if (status !== HttpStatus.OK || !userId) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // TODO: Get user details from Auth service
      // For now, we'll extract basic info from token
      request.user = {
        id: userId,
        email: 'user@example.com', // This should come from the token or user service
        role: 'CUSTOMER', // This should come from the token or user service
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
