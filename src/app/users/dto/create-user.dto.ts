import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateProfileDto } from 'src/app/profile/dto/create-profile.dto';
import { MatchPassword } from 'src/shared';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40, {
    message: 'username must be at most 40 characters long',
  })
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(30, {
    message: 'email must be at most 30 characters long',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'password must be at least 6 characters long',
  })
  @MaxLength(20, {
    message: 'password must be at most 20 characters long',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MatchPassword('password', {
    message: 'passwords do not match',
  })
  confirmPassword: string;

  @IsOptional()
  profile: CreateProfileDto;
}
