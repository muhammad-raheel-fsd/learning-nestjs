import { Injectable } from '@nestjs/common';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class HashtagsService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashtagRepository: Repository<Hashtag>,
  ) {}
  async create(createHashtagDto: CreateHashtagDto) {
    const hashtag = this.hashtagRepository.create(createHashtagDto);
    return this.hashtagRepository.save(hashtag);
  }

  async findAll() {
    return this.hashtagRepository.find();
  }

  async findOne(id: string) {
    return this.hashtagRepository.findOneBy({ id });
  }

  async findHashtagsByIds(ids: string[]) {
    return this.hashtagRepository.find({
      where: { id: In(ids) },
    });
  }

  async update(id: string, updateHashtagDto: UpdateHashtagDto) {
    return this.hashtagRepository.update({ id }, updateHashtagDto);
  }

  async remove(id: string) {
    return this.hashtagRepository.delete({ id });
  }
}
