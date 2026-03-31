import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SubtasksService } from './subtasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @Get('tasks/:id/subtasks')
  findAll(@Param('id', ParseIntPipe) taskId: number) {
    return this.subtasksService.findByTask(taskId);
  }

  @Post('tasks/:id/subtasks')
  create(
    @Param('id', ParseIntPipe) taskId: number,
    @Body('title') title: string,
  ) {
    return this.subtasksService.create(taskId, title);
  }

  @Patch('subtasks/:id/toggle')
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.subtasksService.toggle(id);
  }

  @Delete('subtasks/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subtasksService.remove(id);
  }
}
