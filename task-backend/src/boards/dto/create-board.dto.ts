import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ description: 'Название доски', example: 'Мой проект' })
  @IsNotEmpty({ message: 'Title не может быть пустым' })
  @IsString({ message: 'Title должен быть строкой' })
  title: string;
}
