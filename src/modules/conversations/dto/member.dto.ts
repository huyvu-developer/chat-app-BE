import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MemberDto {
  @IsNotEmpty()
  @IsString()
  user: string;

  @IsOptional()
  @Type(() => Date)
  joinedAt?: Date;
}
