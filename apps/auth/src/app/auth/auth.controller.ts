import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LoginRequestDto, RegisterRequestDto, ValidateRequestDto } from './dto';
import { AuthService } from './auth.service';
import {
  AUTH_SERVICE_NAME,
  RegisterResponse,
  LoginResponse,
  ValidateTokenResponse,
} from '@sofa-web/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Register')
  private async register(
    payload: RegisterRequestDto
  ): Promise<RegisterResponse> {
    return this.authService.register(payload);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  private login(payload: LoginRequestDto): Promise<LoginResponse> {
    return this.authService.login(payload);
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ValidateToken')
  private validateToken(
    payload: ValidateRequestDto
  ): Promise<ValidateTokenResponse> {
    return this.authService.validate(payload);
  }
}
