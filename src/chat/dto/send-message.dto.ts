import { IsString, IsUUID, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsUUID()
  chatId: string;

  @IsString()
  @MinLength(1)
  content: string;
}
