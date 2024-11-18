import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async createUser(data: CreateUserDto) {
    return this.repository.createUser(data);
  }

  async getAllUsers() {
    return this.repository.getAllUsers();
  }

  async getUserById(id: number) {
    return this.repository.getUserById(id);
  }

  async updateUserById(id: number, data: UpdateUserDto) {
    return this.repository.updateUserById(id, data);
  }

  async deleteUser(id: number) {
    return this.repository.deleteUser(id);
  }
}
