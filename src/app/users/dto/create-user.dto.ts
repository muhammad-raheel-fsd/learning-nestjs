import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MatchPassword } from 'src/shared';

export class CreateUserDto {
  @IsNumber()
  @IsOptional()
  id: number;
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, {
    message: 'Name must be at most 50 characters long',
  })
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'], {
    message: 'Gender must be male, female or other',
  })
  gender: string;

  @IsBoolean()
  @IsOptional()
  isMarried: boolean;

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
  //   @MinLength(6, {
  //     message: 'Confirm password must be at least 6 characters long',
  //   })
  //   @MaxLength(20, {
  //     message: 'Confirm password must be at most 20 characters long',
  //   })
  @MatchPassword('password', {
    message: 'passwords do not match',
  })
  confirmPassword: string;
}
