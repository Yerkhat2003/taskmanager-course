import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/client';

export class CreateTaskDto {
  @ApiProperty({ description: 'Название задачи', example: 'Сделать отчёт' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Описание задачи', example: 'Подготовить отчёт за квартал' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Статус задачи', enum: ['todo', 'in_progress', 'done'] })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiProperty({ description: 'ID доски', example: 1 })
  @Type(() => Number)
  @IsInt()
  boardId: number;

  @ApiProperty({ description: 'ID пользователя', example: 1 })
  @Type(() => Number)
  @IsInt()
  userId: number;
}
