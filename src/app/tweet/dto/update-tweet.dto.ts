import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTweetDto } from './create-tweet.dto';

// Exclude userId from updates - can't change tweet ownership
export class UpdateTweetDto extends PartialType(
  OmitType(CreateTweetDto, ['userId'] as const),
) {}
