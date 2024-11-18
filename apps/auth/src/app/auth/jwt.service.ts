import { Injectable } from '@nestjs/common';
import { JwtService as Jwt } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtService {
  constructor(private readonly jwtService: Jwt) {}

  public async decode(token: string): Promise<unknown> {
    return this.jwtService.decode(token);
  }

  public generateToken({ id, email }: { id: number; email: string }): string {
    return this.jwtService.sign({
      id,
      email,
    });
  }

  public async isPasswordValid(
    passport: string,
    userPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(passport, userPassword);
  }

  public async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public async verify(token: string): Promise<{ id: number; email: string }> {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }
}
