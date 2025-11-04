import { Module } from '@nestjs/common';
import { TweetService } from './tweet.service';
import { TweetController } from './tweet.controller';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import { User } from '../users/entities/user.entity';
import { HashtagsModule } from '../hashtags/hashtags.module';

@Module({
  imports: [
    UsersModule,
    HashtagsModule,
    TypeOrmModule.forFeature([Tweet, User]),
  ],
  controllers: [TweetController],
  providers: [TweetService],
})
export class TweetModule {}
