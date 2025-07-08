import { IsString, IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsUUID()
  participantId: string;
}
