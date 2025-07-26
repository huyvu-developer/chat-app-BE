import { IsEnum, IsString } from 'class-validator';
import { AttachmentType } from 'src/utils/const';

export class AttachmentDto {
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsString()
  url: string;
}
