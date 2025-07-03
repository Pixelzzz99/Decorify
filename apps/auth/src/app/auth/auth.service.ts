import { HttpStatus, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';
import { JwtService } from './jwt.service';
import {
  LoginRequest,
  LoginResponse,
  RegisterResponse,
  ValidateTokenResponse,
} from '@sofa-web/common';
import { RegisterRequestDto, ValidateRequestDto } from './dto';
import { AuthRepository } from './auth.repository';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: WinstonLogger
  ) {}

  public async register({
    name,
    email,
    password,
    role,
  }: RegisterRequestDto): Promise<RegisterResponse> {
    this.logger.info('Starting user registration process', {
      context: 'AuthService.register',
      email,
      role: role || 'CUSTOMER',
    });

    try {
      const user = await this.authRepository.findUserByEmail(email);

      if (user) {
        this.logger.warn('Registration attempt with existing email', {
          context: 'AuthService.register',
          email,
        });
        throw new UnauthorizedException('User already exists');
      }

      const hashedPassworrd = await this.jwtService.hashPassword(password);
      const newUser = await this.authRepository.createUser({
        username: name,
        email,
        password: hashedPassworrd,
        role: role ? (role as Role) : 'CUSTOMER',
      });

      this.logger.info('User registration completed successfully', {
        context: 'AuthService.register',
        email,
        userId: newUser?.id,
        role: role || 'CUSTOMER',
      });

      return {
        status: HttpStatus.CREATED,
        errors: null,
      };
    } catch (error) {
      this.logger.error('User registration failed', {
        context: 'AuthService.register',
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
  public async login({
    email,
    password,
  }: LoginRequest): Promise<LoginResponse> {
    this.logger.info('Starting user login process', {
      context: 'AuthService.login',
      email,
    });

    try {
      const user = await this.authRepository.findUserByEmail(email);
      if (!user) {
        this.logger.warn('Login attempt with non-existent email', {
          context: 'AuthService.login',
          email,
        });
        return {
          status: HttpStatus.UNAUTHORIZED,
          errors: ['Invalid credentials'],
          token: null,
        };
      }

      const isPasswordValid = await this.jwtService.isPasswordValid(
        password,
        user.password
      );
      if (!isPasswordValid) {
        this.logger.warn('Login attempt with invalid password', {
          context: 'AuthService.login',
          email,
          userId: user.id,
        });
        return {
          status: HttpStatus.UNAUTHORIZED,
          errors: ['Invalid credentials'],
          token: null,
        };
      }

      const token = this.jwtService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      this.logger.info('User login completed successfully', {
        context: 'AuthService.login',
        email,
        userId: user.id,
        role: user.role,
      });

      return {
        status: HttpStatus.OK,
        errors: null,
        token,
      };
    } catch (error) {
      this.logger.error('User login failed', {
        context: 'AuthService.login',
        email,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  public async validate({
    token,
  }: ValidateRequestDto): Promise<ValidateTokenResponse> {
    this.logger.debug('Starting token validation', {
      context: 'AuthService.validate',
      tokenLength: token?.length || 0,
    });

    try {
      const decoded = await this.jwtService.verify(token);
      if (!decoded) {
        this.logger.warn('Token validation failed - invalid token', {
          context: 'AuthService.validate',
          tokenLength: token?.length || 0,
        });
        return {
          status: HttpStatus.FORBIDDEN,
          errors: ['Invalid token'],
          userId: null,
        };
      }

      this.logger.debug('Token validation successful', {
        context: 'AuthService.validate',
        userId: decoded.id,
        email: decoded.email,
      });

      return {
        status: HttpStatus.OK,
        errors: null,
        userId: decoded.id,
      };
    } catch (error) {
      this.logger.error('Token validation failed with exception', {
        context: 'AuthService.validate',
        error: error.message,
        stack: error.stack,
      });
      return {
        status: HttpStatus.CONFLICT,
        errors: ['User not found'],
        userId: null,
      };
    }
  }
}
