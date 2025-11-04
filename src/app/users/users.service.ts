import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Profile } from '../profile/entities/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRespository: Repository<Profile>,
    @Inject(forwardRef(() => AuthService)) // Use @Inject with forwardRef
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    createUserDto.profile = createUserDto.profile ?? {};
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  // findAll now checks authentication using AuthService
  findAll() {
    // Simulating authentication check
    // const authCheck = this.authService.findOne(1); // Check if auth exists
    return this.userRepository.find({
      relations: ['profile'],
    });
  }

  async findOne(id: string) {
    // return this.userRepository.findOne({
    //   where: { id },
    //   relations: ['profile'],
    // });

    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userRepository.update({ id }, updateUserDto);
  }

  remove(id: string) {
    return this.userRepository.delete({ id });
  }
}
