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
import { AuthService } from '../auth.service';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private authService: any;

  constructor(@Inject(AUTH_SERVICE_NAME) private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService(AUTH_SERVICE_NAME);
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  public async canActivate(
    context: ExecutionContext
  ): Promise<boolean> | never {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const { status, userId }: ValidateTokenResponse =
        await this.authService.validate({ token });

      if (status !== HttpStatus.OK) {
        throw new UnauthorizedException();
      }

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
