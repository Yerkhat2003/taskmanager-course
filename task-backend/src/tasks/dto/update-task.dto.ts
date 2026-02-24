import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  boardId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
