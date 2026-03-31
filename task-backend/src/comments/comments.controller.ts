import {
  Controller, Get, Post, Delete,
  Body, Param, ParseIntPipe,
  HttpCode, HttpStatus, UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('tasks/:id/comments')
  getComments(@Param('id', ParseIntPipe) taskId: number) {
    return this.commentsService.findByTask(taskId);
  }

  @Post('tasks/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  createComment(
    @Param('id', ParseIntPipe) taskId: number,
    @Body('content') content: string,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    return this.commentsService.create(taskId, user.userId, content);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  deleteComment(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as any;
    return this.commentsService.remove(id, user.userId, user.role);
  }
}
