import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../../generated/prisma/client';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Type(() => Number)
  @IsInt()
  boardId: number;

  @Type(() => Number)
  @IsInt()
  userId: number;
}
