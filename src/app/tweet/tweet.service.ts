import { Injectable } from '@nestjs/common';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { InjectRepository } from '@nestjs/typeorm';
// import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetResposity: Repository<Tweet>,
    private readonly userService: UsersService,
    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>,
  ) {}
  async create(createTweetDto: CreateTweetDto) {
    const user = await this.userService.findOne(createTweetDto.userId);
    if (!user) {
      throw new Error('User not found');
    }
    const tweet = this.tweetResposity.create({
      ...createTweetDto,
      user,
    });
    return this.tweetResposity.save(tweet);
  }

  async findAll(userId: string) {
    return this.tweetResposity.find({
      // relations: ['user'],
      where: { user: { id: userId } },
    });
  }

  async findOne(id: string) {
    return this.tweetResposity.findOneBy({
      id,
    });
  }

  async update(id: string, updateTweetDto: UpdateTweetDto) {
    return this.tweetResposity.update({ id }, updateTweetDto);
  }

  async remove(id: string) {
    return this.tweetResposity.delete({ id });
  }
}

// dummy tweet
// const dummyTweet: Tweet = {
//   "id": '1',
//   "title": 'Dummy Tweet',
//   "content": 'This is a dummy tweet content',
//   "image": 'http://dummyimage.com/200x200',
//   "userId": "09662234-f782-4b42-81b9-92183f2171a4"
// };
