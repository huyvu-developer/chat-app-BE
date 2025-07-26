import { ValidateNested, ArrayMinSize, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { MemberDto } from './member.dto';

export class CreateConversationDto {
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => MemberDto)
  members: MemberDto[];
}
