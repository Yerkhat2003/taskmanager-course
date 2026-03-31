import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('boards/:id/history')
  getBoardHistory(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.findByBoard(id);
  }

  @Get('tasks/:id/history')
  getTaskHistory(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.findByTask(id);
  }
}
