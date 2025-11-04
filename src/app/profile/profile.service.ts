import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}
  async create(createProfileDto: CreateProfileDto) {
    const profile = this.profileRepository.create(createProfileDto);
    return this.profileRepository.save(profile);
  }

  findAll() {
    return this.profileRepository.find({
      relations: ['user'],
    });
  }

  findOne(id: string) {
    return this.profileRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  update(id: number, updateProfileDto: UpdateProfileDto) {
    return `This action updates a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
