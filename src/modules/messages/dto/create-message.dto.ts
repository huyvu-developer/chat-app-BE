import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  IsEnum,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { AttachmentDto } from './attachment.dto';
import { MessageType } from 'src/utils/const';
import { Types } from 'mongoose';

export class CreateMessageDto {
  @IsMongoId({ message: 'Invalid senderId value' })
  @IsOptional()
  sender: Types.ObjectId;

  @IsMongoId({ message: 'Invalid conversationId value' })
  conversation: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  metadata?: [];

  @IsEnum(MessageType)
  type: MessageType;

  @IsMongoId()
  @IsOptional()
  reply?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
