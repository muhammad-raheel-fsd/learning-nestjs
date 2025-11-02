import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => AuthService)) // Use @Inject with forwardRef
    private readonly authService: AuthService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  // findAll now checks authentication using AuthService
  findAll() {
    // Simulating authentication check
    const authCheck = this.authService.findOne(1); // Check if auth exists
    return {
      message: 'Authenticated user can view all users',
      authCheck,
      users: ['user1', 'user2', 'user3'],
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
