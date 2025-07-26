import { IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  reacts?: Map<string, string[]>;
}
