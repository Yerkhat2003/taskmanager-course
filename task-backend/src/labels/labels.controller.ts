import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('labels')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  @Get()
  findAll(@Query('boardId') boardId?: string) {
    return this.labelsService.findAll(boardId ? parseInt(boardId) : undefined);
  }

  @Post()
  create(@Body() body: { name: string; color: string; boardId?: number }) {
    return this.labelsService.create(body.name, body.color, body.boardId);
  }

  @Post('tasks/:taskId/labels/:labelId')
  addToTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('labelId', ParseIntPipe) labelId: number,
  ) {
    return this.labelsService.addToTask(taskId, labelId);
  }

  @Delete('tasks/:taskId/labels/:labelId')
  removeFromTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('labelId', ParseIntPipe) labelId: number,
  ) {
    return this.labelsService.removeFromTask(taskId, labelId);
  }
}
