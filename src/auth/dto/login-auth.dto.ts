import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}
