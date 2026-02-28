import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/client';

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Название задачи' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Описание задачи' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Статус задачи', enum: ['todo', 'in_progress', 'done'] })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ description: 'ID доски' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  boardId?: number;

  @ApiPropertyOptional({ description: 'ID пользователя' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
