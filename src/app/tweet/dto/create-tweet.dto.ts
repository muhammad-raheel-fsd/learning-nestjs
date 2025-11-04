import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTweetDto {
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(100)
  title: string;

  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(300)
  content: string;

  @IsNotEmpty()
  image: string;

  @IsNotEmpty()
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  userId: string;

  @IsOptional()
  @IsUUID('4', { each: true, message: 'Each hashtagId must be a valid UUID' })
  hashtagsIds?: string[];
}
