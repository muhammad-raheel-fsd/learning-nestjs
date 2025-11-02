import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetUserParamDto {
  @IsNotEmpty()
  @IsString()
  // @Type(() => Number)
  id: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  detailed: boolean;
}
