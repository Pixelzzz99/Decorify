import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from './jwt.service';
import {
  LoginRequest,
  LoginResponse,
  RegisterResponse,
  ValidateTokenResponse,
} from '@sofa-web/common';
import { RegisterRequestDto, ValidateRequestDto } from './dto';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository
  ) {}

  public async register({
    name,
    email,
    password,
    role,
  }: RegisterRequestDto): Promise<RegisterResponse> {
    const user = await this.authRepository.findUserByEmail(email);

    if (user) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassworrd = await this.jwtService.hashPassword(password);
    this.authRepository.createUser({
      username: name,
      email,
      password: hashedPassworrd,
      role,
    });

    return {
      status: HttpStatus.CREATED,
      errors: null,
    };
  }
  public async login({
    email,
    password,
  }: LoginRequest): Promise<LoginResponse> {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
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
    return {
      status: HttpStatus.OK,
      errors: null,
      token,
    };
  }

  public async validate({
    token,
  }: ValidateRequestDto): Promise<ValidateTokenResponse> {
    try {
      const decoded = await this.jwtService.verify(token);
      if (!decoded) {
        return {
          status: HttpStatus.FORBIDDEN,
          errors: ['Invalid token'],
          userId: null,
        };
      }

      return {
        status: HttpStatus.OK,
        errors: null,
        userId: decoded.id,
      };
    } catch {
      return {
        status: HttpStatus.CONFLICT,
        errors: ['User not found'],
        userId: null,
      };
    }
  }
}
