import { Controller, Post, Get, Param, Body, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post('comments/:id/reactions')
  toggle(
    @Param('id', ParseIntPipe) commentId: number,
    @Body('emoji') emoji: string,
    @Req() req: any,
  ) {
    return this.reactionsService.toggle(commentId, req.user.userId, emoji);
  }

  @Get('comments/:id/reactions')
  findAll(@Param('id', ParseIntPipe) commentId: number) {
    return this.reactionsService.findByComment(commentId);
  }
}
