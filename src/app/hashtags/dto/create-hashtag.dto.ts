import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateHashtagDto {
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}
