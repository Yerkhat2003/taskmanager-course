import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, ParseIntPipe,
  HttpCode, HttpStatus, UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('search')
  searchTasks(@Query('q') q: string) {
    return this.tasksService.search(q || '');
  }

  @Get()
  getTasks(@Query('boardId') boardId?: string) {
    return this.tasksService.findAll(boardId ? +boardId : undefined);
  }

  @Get(':id')
  getTask(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTask(
    @Body() body: {
      title: string;
      description?: string;
      boardId: number;
      priority?: string;
      dueDate?: string;
      assigneeId?: number;
      fileUrl?: string;
      filename?: string;
    },
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.tasksService.create({
      title: body.title,
      description: body.description,
      boardId: body.boardId,
      userId: user.userId,
      priority: body.priority,
      dueDate: body.dueDate,
      assigneeId: body.assigneeId,
      fileUrl: body.fileUrl,
      filename: body.filename,
    });
  }

  @Patch(':id')
  updateTask(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      assigneeId?: number | null;
    },
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.tasksService.update(id, body, user.userId, user.role);
  }

  @Patch(':id/reorder')
  reorderTask(
    @Param('id', ParseIntPipe) id: number,
    @Body('order') order: number,
  ) {
    return this.tasksService.reorder(id, order);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteTask(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.tasksService.remove(id, user.userId, user.role);
  }
}
