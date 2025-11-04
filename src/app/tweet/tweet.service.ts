import { Injectable } from '@nestjs/common';
import { CreateTweetDto } from './dto/create-tweet.dto';
import { UpdateTweetDto } from './dto/update-tweet.dto';
import { Repository } from 'typeorm';
import { Tweet } from './entities/tweet.entity';
import { InjectRepository } from '@nestjs/typeorm';
// import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { HashtagsService } from '../hashtags/hashtags.service';

@Injectable()
export class TweetService {
  constructor(
    @InjectRepository(Tweet)
    private readonly tweetResposity: Repository<Tweet>,
    private readonly userService: UsersService,
    private readonly hashtagsService: HashtagsService,
    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>,
  ) {}
  async create(createTweetDto: CreateTweetDto) {
    // Fetch user
    const user = await this.userService.findOne(createTweetDto.userId);
    if (!user) {
      throw new Error('User not found');
    }
    // Fetch hashtags
    let hashtags = [] as typeof Tweet.prototype.hashtags;
    if (createTweetDto.hashtagsIds && createTweetDto.hashtagsIds.length > 0) {
      hashtags = await this.hashtagsService.findHashtagsByIds(
        createTweetDto.hashtagsIds,
      );
    }
    const tweet = this.tweetResposity.create({
      ...createTweetDto,
      user,
      hashtags,
    });
    return this.tweetResposity.save(tweet);
  }

  async findAll(userId: string) {
    return this.tweetResposity.find({
      relations: ['user', 'hashtags'],
      where: { user: { id: userId } },
    });
  }

  // async findOne(id: string) {
  //   return this.tweetResposity.findOneBy({
  //     id,
  //   });
  // }
  async findOne(id: string) {
    return this.tweetResposity.findOne({
      where: { id },
      relations: ['user', 'hashtags'],
    });
  }

  async update(id: string, updateTweetDto: UpdateTweetDto) {
    // Find all hashtags if any
    let hashtags = [] as typeof Tweet.prototype.hashtags;
    if (updateTweetDto.hashtagsIds && updateTweetDto.hashtagsIds.length > 0) {
      hashtags = await this.hashtagsService.findHashtagsByIds(
        updateTweetDto.hashtagsIds,
      );
    }

    return this.tweetResposity.update({ id }, { ...updateTweetDto, hashtags });
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
