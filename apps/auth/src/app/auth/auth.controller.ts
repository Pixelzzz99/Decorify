import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
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
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger
  ) {}

  @GrpcMethod(AUTH_SERVICE_NAME, 'Register')
  private async register(
    payload: RegisterRequestDto
  ): Promise<RegisterResponse> {
    this.logger.info('User registration attempt', {
      context: 'AuthController.register',
      email: payload.email,
      requestId: Math.random().toString(36).substr(2, 9),
    });

    try {
      const result = await this.authService.register(payload);

      this.logger.info('User registration successful', {
        context: 'AuthController.register',
        email: payload.email,
        status: result.status,
      });

      return result;
    } catch (error) {
      this.logger.error('User registration failed', {
        context: 'AuthController.register',
        email: payload.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Login')
  private async login(payload: LoginRequestDto): Promise<LoginResponse> {
    this.logger.info('User login attempt', {
      context: 'AuthController.login',
      email: payload.email,
      requestId: Math.random().toString(36).substr(2, 9),
    });

    try {
      const result = await this.authService.login(payload);

      this.logger.info('User login successful', {
        context: 'AuthController.login',
        email: payload.email,
        hasToken: !!result.token,
      });

      return result;
    } catch (error) {
      this.logger.error('User login failed', {
        context: 'AuthController.login',
        email: payload.email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'ValidateToken')
  private async validateToken(
    payload: ValidateRequestDto
  ): Promise<ValidateTokenResponse> {
    this.logger.debug('Token validation request', {
      context: 'AuthController.validateToken',
      tokenLength: payload.token?.length || 0,
      requestId: Math.random().toString(36).substr(2, 9),
    });

    try {
      const result = await this.authService.validate(payload);

      this.logger.debug('Token validation successful', {
        context: 'AuthController.validateToken',
        userId: result.userId,
        status: result.status,
      });

      return result;
    } catch (error) {
      this.logger.error('Token validation failed', {
        context: 'AuthController.validateToken',
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
