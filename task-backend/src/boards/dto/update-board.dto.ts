import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBoardDto {
  @ApiPropertyOptional({ description: 'Название доски', example: 'Обновлённый проект' })
  @IsOptional()
  @IsString()
  title?: string;
}
