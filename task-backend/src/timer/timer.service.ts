import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimerService {
  constructor(private readonly prisma: PrismaService) {}

  async start(taskId: number, userId: number) {
    const active = await this.prisma.timeLog.findFirst({
      where: { taskId, userId, stoppedAt: null },
    });
    if (active) throw new BadRequestException('Таймер уже запущен');
    return this.prisma.timeLog.create({ data: { taskId, userId } });
  }

  async stop(taskId: number, userId: number) {
    const active = await this.prisma.timeLog.findFirst({
      where: { taskId, userId, stoppedAt: null },
      orderBy: { startedAt: 'desc' },
    });
    if (!active) throw new NotFoundException('Активный таймер не найден');

    const now = new Date();
    const duration = Math.floor((now.getTime() - active.startedAt.getTime()) / 60000);

    return this.prisma.timeLog.update({
      where: { id: active.id },
      data: { stoppedAt: now, duration },
    });
  }

  async getStatus(taskId: number, userId: number) {
    const active = await this.prisma.timeLog.findFirst({
      where: { taskId, userId, stoppedAt: null },
    });

    const logs = await this.prisma.timeLog.findMany({
      where: { taskId, stoppedAt: { not: null } },
      orderBy: { startedAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
    });

    const totalMinutes = logs.reduce((sum, l) => sum + (l.duration ?? 0), 0);

    return {
      running: !!active,
      startedAt: active?.startedAt ?? null,
      totalMinutes,
      logs,
    };
  }
}
