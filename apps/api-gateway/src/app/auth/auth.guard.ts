import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ValidateTokenResponse } from '@sofa-web/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(AuthService)
  public readonly service: AuthService;

  public async canActivate(
    context: ExecutionContext
  ): Promise<boolean> | never {
    const request: Request = context.switchToHttp().getRequest();
    const authorization: string = request.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const bearer: string[] = authorization.split(' ');

    if (!bearer || bearer.length < 2) {
      throw new UnauthorizedException();
    }

    const token: string = bearer[1];

    const { status, userId }: ValidateTokenResponse =
      await this.service.validate(token);

    request['user'] = userId;

    if (status !== HttpStatus.OK) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
