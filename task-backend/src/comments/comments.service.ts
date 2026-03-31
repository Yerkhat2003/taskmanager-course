import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  findByTask(taskId: number) {
    return this.prisma.comment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(taskId: number, userId: number, content: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        user: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        comments: { select: { userId: true } },
      },
    });

    const comment = await this.prisma.comment.create({
      data: { taskId, userId, content },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    if (task) {
      const commenter = comment.user;
      const link = `/boards/${task.boardId}?task=${task.id}&tab=comments`;


      const toNotify = new Set<number>();
      toNotify.add(task.userId);
      if (task.assignee) toNotify.add(task.assignee.id);
      for (const c of task.comments) toNotify.add(c.userId);
      toNotify.delete(userId);

      const msg = `${commenter.name} прокомментировал задачу "${task.title}"`;
      for (const recipientId of toNotify) {
        void this.notifications.create({ userId: recipientId, type: 'comment_added', message: msg, link })
          .then(() => this.logger.log(`Notification → user ${recipientId}: ${msg}`))
          .catch((err: Error) => this.logger.error(`Failed to notify ${recipientId}: ${err.message}`));
      }


      const mentionRegex = /@(\S+)/g;
      const mentions = [...content.matchAll(mentionRegex)].map((m) => m[1]);
      if (mentions.length > 0) {
        const mentionedUsers = await this.prisma.user.findMany({
          where: { name: { in: mentions } },
          select: { id: true },
        });
        for (const mu of mentionedUsers) {
          if (mu.id === userId || toNotify.has(mu.id)) continue;
          void this.notifications.create({
            userId: mu.id,
            type: 'mention',
            message: `${commenter.name} упомянул вас в задаче "${task.title}"`,
            link,
          }).catch((err: Error) => this.logger.error(`Mention notify failed: ${err.message}`));
        }
      }
    }

    return comment;
  }

  async remove(id: number, requestUserId: number, requestUserRole: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== requestUserId && requestUserRole !== 'ADMIN') {
      throw new ForbiddenException('You can only delete your own comments');
    }
    return this.prisma.comment.delete({ where: { id } });
  }
}
