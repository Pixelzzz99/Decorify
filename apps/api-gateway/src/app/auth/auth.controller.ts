import { Controller, OnModuleInit, Body, Inject, Post } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import {
  AuthServiceClient,
  RegisterResponse,
  RegisterRequest,
  AUTH_SERVICE_NAME,
  LoginRequest,
  LoginResponse,
} from '@sofa-web/common';

// DTO классы для Swagger документации
class RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: string;
}

class LoginDto {
  email: string;
  password: string;
}

class AuthResponseDto {
  token?: string;
  status: number;
  errors?: string[];
}

@ApiTags('auth')
@Controller('auth')
export class AuthController implements OnModuleInit {
  private svc: AuthServiceClient;

  @Inject(AUTH_SERVICE_NAME)
  private readonly client: ClientGrpc;

  public onModuleInit() {
    this.svc = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация нового пользователя',
    description: 'Создает новый аккаунт пользователя в системе. Доступные роли: CUSTOMER, VENDOR, ADMIN'
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Данные для регистрации пользователя',
    examples: {
      customer: {
        summary: 'Регистрация покупателя',
        value: {
          name: 'Иван Иванов',
          email: 'ivan@example.com',
          password: 'password123',
          role: 'CUSTOMER'
        }
      },
      vendor: {
        summary: 'Регистрация поставщика',
        value: {
          name: 'Мебельная компания',
          email: 'vendor@furniture.com',
          password: 'securepass123',
          role: 'VENDOR'
        }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: AuthResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Некорректные данные (невалидный email, слабый пароль)',
    schema: {
      example: {
        status: 400,
        errors: ['Email is not valid', 'Password must be at least 6 characters']
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь с таким email уже существует',
    schema: {
      example: {
        status: 401,
        errors: ['User already exists']
      }
    }
  })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  private async register(
    @Body() body: RegisterRequest
  ): Promise<Observable<RegisterResponse>> {
    return this.svc.register(body);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Авторизация пользователя',
    description: 'Аутентифицирует пользователя и возвращает JWT токен для доступа к защищенным ресурсам'
  })
  @ApiBody({
    type: LoginDto,
    description: 'Учетные данные пользователя',
    examples: {
      example1: {
        summary: 'Обычный вход',
        value: {
          email: 'user@example.com',
          password: 'password123'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Успешная авторизация',
    schema: {
      example: {
        status: 200,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        errors: null
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Неверные учетные данные',
    schema: {
      example: {
        status: 401,
        errors: ['Invalid credentials']
      }
    }
  })
  @ApiInternalServerErrorResponse({ description: 'Внутренняя ошибка сервера' })
  private async login(
    @Body() body: LoginRequest
  ): Promise<Observable<LoginResponse>> {
    return this.svc.login(body);
  }
}
