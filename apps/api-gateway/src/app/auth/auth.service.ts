import { Injectable, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  AuthServiceClient,
  AUTH_SERVICE_NAME,
  ValidateTokenResponse,
} from '@sofa-web/common';

@Injectable()
export class AuthService {
  private svc: AuthServiceClient;

  @Inject(AUTH_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit() {
    this.svc = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  public async validate(token: string): Promise<ValidateTokenResponse> {
    return firstValueFrom(this.svc.validateToken({ token }));
  }
}
