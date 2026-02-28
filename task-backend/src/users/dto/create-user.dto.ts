import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Имя пользователя', example: 'Иван Иванов' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email пользователя', example: 'ivan@example.com' })
  @IsEmail()
  email: string;
}
