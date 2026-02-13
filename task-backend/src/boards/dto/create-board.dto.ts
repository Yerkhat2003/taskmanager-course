import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty({ message: 'Title не может быть пустым' })
  @IsString({ message: 'Title должен быть строкой' })
  title: string;
}
