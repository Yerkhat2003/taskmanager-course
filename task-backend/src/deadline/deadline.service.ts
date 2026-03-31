import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class DeadlineService {
  private readonly logger = new Logger(DeadlineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly email: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkDeadlines() {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const tasks = await this.prisma.task.findMany({
      where: { dueDate: { gte: in24h, lt: in25h }, status: { not: 'done' } },
      include: {
        user: { select: { id: true, email: true } },
        assignee: { select: { id: true, email: true } },
      },
    });

    for (const task of tasks) {
      const link = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/boards/${task.boardId}?task=${task.id}`;
      const recipients: { id: number; email: string }[] = [task.user];
      if (task.assignee && task.assignee.id !== task.user.id) {
        recipients.push(task.assignee);
      }

      for (const recipient of recipients) {
        try {
          await this.notifications.create({
            userId: recipient.id,
            type: 'deadline',
            message: `⏰ Через 24 часа дедлайн задачи "${task.title}"`,
            link: `/boards/${task.boardId}?task=${task.id}`,
          });
          await this.email.sendDeadlineReminder(recipient.email, task.title, task.dueDate!, link);
        } catch (err) {
          this.logger.error(`Deadline notify failed for user ${recipient.id}: ${(err as Error).message}`);
        }
      }
    }

    if (tasks.length > 0) {
      this.logger.log(`Deadline reminders sent for ${tasks.length} tasks`);
    }
  }
}
