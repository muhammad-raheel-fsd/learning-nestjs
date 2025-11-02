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
    const profile = this.profileRespository.create(createUserDto.profile);
    await this.profileRespository.save(profile);
    const user = this.userRepository.create(createUserDto);
    user.profile = profile;
    return this.userRepository.save(user);
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

  async findOne(id: string) {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

// {
//   "profile": {
//     "firstName": "Jane",
//     "lastName": "Doe",
//     "dob": "1990-05-15T00:00:00.000Z",
//     "bio": "Software engineer with 10 years of experience building APIs and web applications.",
//     "profilePicture": "https://example.com/avatars/jane.jpg",
//   }
// }
