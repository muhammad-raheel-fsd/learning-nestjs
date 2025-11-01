import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class GetUserParamDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  detailed: boolean;
}
