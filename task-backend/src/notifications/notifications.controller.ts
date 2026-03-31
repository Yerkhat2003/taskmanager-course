import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationsService.findByUser(user.userId);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationsService.countUnread(user.userId).then((count) => ({ count }));
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markRead(id);
  }

  @Patch('read-all')
  markAllRead(@Req() req: Request) {
    const user = req.user as any;
    return this.notificationsService.markAllRead(user.userId);
  }
}
