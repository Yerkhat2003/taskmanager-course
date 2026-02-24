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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '../generated/prisma/client';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(@Query('boardId') boardId?: string): Promise<Task[]> {
    if (boardId) {
      return this.tasksService.findByBoardId(+boardId);
    }
    return this.tasksService.findAll();
  }

  @Get(':id')
  async getTask(@Param('id') id: string): Promise<Task | null> {
    return this.tasksService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<Task> {
    return this.tasksService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: string): Promise<void> {
    await this.tasksService.remove(+id);
  }
}
