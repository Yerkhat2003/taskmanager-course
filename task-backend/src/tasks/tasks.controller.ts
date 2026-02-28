import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '../generated/prisma/client';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все задачи (с фильтром по status)' })
  @ApiQuery({ name: 'status', required: false, enum: ['todo', 'in_progress', 'done'], description: 'Фильтр по статусу' })
  @ApiQuery({ name: 'boardId', required: false, description: 'Фильтр по ID доски' })
  @ApiResponse({ status: 200, description: 'Список задач' })
  async getTasks(
    @Query('status') status?: string,
    @Query('boardId') boardId?: string,
  ): Promise<Task[]> {
    if (boardId) {
      return this.tasksService.findByBoardId(+boardId, status);
    }
    return this.tasksService.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить задачу с пользователем' })
  @ApiResponse({ status: 200, description: 'Задача с включённым пользователем (include: user)' })
  @ApiResponse({ status: 404, description: 'Задача не найдена' })
  async getTask(@Param('id') id: string): Promise<Task | null> {
    return this.tasksService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать задачу' })
  @ApiResponse({ status: 201, description: 'Задача создана' })
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить задачу' })
  async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<Task> {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить задачу' })
  @ApiResponse({ status: 204, description: 'Задача удалена' })
  async deleteTask(@Param('id') id: string): Promise<void> {
    await this.tasksService.remove(+id);
  }
}
