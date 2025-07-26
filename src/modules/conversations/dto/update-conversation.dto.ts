import {
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MemberDto } from './member.dto';

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  isGroup?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MemberDto)
  members?: MemberDto[];

  @IsOptional()
  @IsMongoId()
  lastMessage?: string;
}
