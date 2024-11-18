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
    username,
    email,
    password,
  }: RegisterRequestDto): Promise<RegisterResponse> {
    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassworrd = await this.jwtService.hashPassword(password);
    this.authRepository.createUser({
      username,
      email,
      password: hashedPassworrd,
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
        status: HttpStatus.NOT_FOUND,
        errors: ['User not found'],
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
        errors: ['Invalid password'],
        token: null,
      };
    }

    const token = this.jwtService.generateToken({
      id: user.id,
      email: user.email,
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
    const decoded = await this.jwtService.verify(token);

    if (!decoded) {
      return {
        status: HttpStatus.FORBIDDEN,
        errors: ['Invalid token'],
        userId: null,
      };
    }

    const auth = await this.authRepository.findUserById(decoded.id);
    if (!auth) {
      return {
        status: HttpStatus.CONFLICT,
        errors: ['User not found'],
        userId: null,
      };
    }
    return {
      status: HttpStatus.OK,
      errors: null,
      userId: auth.id,
    };
  }

  public async validateUser(id: number) {
    const auth = await this.authRepository.findUserById(id);
    if (!auth) {
      return {
        status: HttpStatus.CONFLICT,
        errors: ['User not found'],
        userId: null,
      };
    }
    return {
      status: HttpStatus.OK,
      errors: null,
      userId: auth.id,
    };
  }
}
