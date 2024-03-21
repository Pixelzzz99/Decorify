import { Controller, OnModuleInit, Body, Inject, Post } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  AuthServiceClient,
  RegisterResponse,
  RegisterRequest,
  AUTH_SERVICE_NAME,
  LoginRequest,
  LoginResponse,
} from '@sofa-web/common';

@Controller('auth')
export class AuthController implements OnModuleInit {
  private svc: AuthServiceClient;

  @Inject(AUTH_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit() {
    this.svc = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  @Post('register')
  private async register(
    @Body() body: RegisterRequest
  ): Promise<Observable<RegisterResponse>> {
    return this.svc.register(body);
  }

  @Post('login')
  private async login(
    @Body() body: LoginRequest
  ): Promise<Observable<LoginResponse>> {
    return this.svc.login(body);
  }
}
