import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/shared/types';

export class CreateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(50, {
    message: 'firstName must be at most 50 characters long',
  })
  firstName: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, {
    message: 'lastName must be at most 50 characters long',
  })
  lastName: string;

  @IsString()
  @IsOptional()
  dob: Date;

  @IsString()
  @IsOptional()
  @MinLength(10, {
    message: 'bio must be at least 10 characters long',
  })
  @MaxLength(200, {
    message: 'bio must be at most 200 characters long',
  })
  bio: string;

  @IsString()
  @IsOptional()
  profilePicture: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'], {
    message: 'Gender must be male, female or other',
  })
  gender: Gender;
}
