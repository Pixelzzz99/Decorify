import {
  Post,
  Get,
  Body,
  Param,
  Put,
  Delete,
  Controller,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
}
