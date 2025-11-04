import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

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
  userId: string;
}
