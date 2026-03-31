import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entityType: string, entityId: number, action: string, userId: number, details = '') {
    try {
      await this.prisma.auditLog.create({
        data: { entityType, entityId, action, userId, details },
      });
    } catch (err) {
      this.logger.error(`Failed to create audit log: ${(err as Error).message}`);
    }
  }

  findByBoard(boardId: number) {
    return this.prisma.auditLog.findMany({
      where: { entityType: 'board', entityId: boardId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  findByTask(taskId: number) {
    return this.prisma.auditLog.findMany({
      where: { entityType: 'task', entityId: taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
