import { Controller, Get, Post, Param, Req, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TimerService } from './timer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks/:id/timer')
export class TimerController {
  constructor(private readonly timerService: TimerService) {}

  @Get()
  status(@Param('id', ParseIntPipe) taskId: number, @Req() req: any) {
    return this.timerService.getStatus(taskId, req.user.userId);
  }

  @Post('start')
  start(@Param('id', ParseIntPipe) taskId: number, @Req() req: any) {
    return this.timerService.start(taskId, req.user.userId);
  }

  @Post('stop')
  stop(@Param('id', ParseIntPipe) taskId: number, @Req() req: any) {
    return this.timerService.stop(taskId, req.user.userId);
  }
}
