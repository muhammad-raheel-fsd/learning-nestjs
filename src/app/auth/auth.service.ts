import { Injectable, Inject, forwardRef } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import * as authConfig from './config/auth.config';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) // Use @Inject with forwardRef
    private readonly usersService: UsersService,
    @Inject(authConfig.default.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig.default>,
  ) {}

  // Login method that uses UsersService to get user by id
  login(userId: string) {
    const user = this.usersService.findOne(userId);
    return {
      message: 'User logged in successfully',
      user,
    };
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    console.log('Auth Config ===========:', this.authConfiguration);
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
