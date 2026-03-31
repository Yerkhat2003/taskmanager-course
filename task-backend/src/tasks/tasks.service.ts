import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksGateway } from '../gateways/tasks.gateway';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

const TASK_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
  assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
  attachments: { select: { id: true, filename: true, url: true } },
  _count: { select: { comments: true } },
};

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: TasksGateway,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  private async notify(data: { userId: number; type: string; message: string; link?: string }) {
    try {
      await this.notifications.create(data);
      this.logger.log(`Notification sent to user ${data.userId}: ${data.message}`);
    } catch (err) {
      this.logger.error(`Failed to create notification: ${(err as Error).message}`);
    }
  }

  findAll(boardId?: number) {
    return this.prisma.task.findMany({
      where: boardId ? { boardId } : undefined,
      include: TASK_INCLUDE,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  search(q: string) {
    return this.prisma.task.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      },
      include: {
        ...TASK_INCLUDE,
        board: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async reorder(id: number, newOrder: number) {
    return this.prisma.task.update({ where: { id }, data: { order: newOrder } });
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: TASK_INCLUDE,
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(data: {
    title: string;
    description?: string;
    boardId: number;
    userId: number;
    priority?: string;
    dueDate?: string;
    assigneeId?: number;
    fileUrl?: string;
    filename?: string;
  }) {
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description || '',
        boardId: data.boardId,
        userId: data.userId,
        priority: data.priority || 'medium',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assigneeId: data.assigneeId ?? undefined,
      },
      include: TASK_INCLUDE,
    });

    let finalTask = task;
    if (data.fileUrl && data.filename) {
      await this.prisma.fileAttachment.create({
        data: {
          taskId: task.id,
          userId: data.userId,
          filename: data.filename,
          url: data.fileUrl,
        },
      });
      finalTask = await this.prisma.task.findUnique({
        where: { id: task.id },
        include: TASK_INCLUDE,
      }) as typeof task;
    }

    void this.audit.log('task', finalTask.id, 'created', data.userId, `Title: "${finalTask.title}"`);

    if (data.assigneeId) {
      if (data.assigneeId !== data.userId) {
        void this.notify({
          userId: data.assigneeId,
          type: 'task_assigned',
          message: `Тебя назначили на задачу "${finalTask.title}"`,
          link: `/boards/${finalTask.boardId}?task=${finalTask.id}`,
        });
      } else {
        void this.notify({
          userId: data.userId,
          type: 'task_assigned',
          message: `Вы создали задачу "${finalTask.title}" и назначили на себя`,
          link: `/boards/${finalTask.boardId}?task=${finalTask.id}`,
        });
      }
    }

    this.gateway.emitTaskCreated(finalTask.boardId, finalTask);
    return finalTask;
  }

  async update(
    id: number,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string | null;
      assigneeId?: number | null;
    },
    requestUserId: number,
    requestUserRole: string,
  ) {
    const task = await this.ensureExists(id);

    if (task.userId !== requestUserId && requestUserRole !== 'ADMIN') {

      const membership = await this.prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId: task.boardId, userId: requestUserId } },
      });
      const isBoardOwnerOrEditor =
        membership && (membership.role === 'owner' || membership.role === 'editor');

      if (!isBoardOwnerOrEditor) {
        throw new ForbiddenException('You can only edit your own tasks');
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      },
      include: TASK_INCLUDE,
    });

    const details = data.status ? `Status: ${task.status} → ${data.status}` : '';
    void this.audit.log('task', id, 'updated', requestUserId, details);


    if (data.assigneeId && data.assigneeId !== task.assigneeId) {
      if (data.assigneeId !== requestUserId) {
        void this.notify({
          userId: data.assigneeId,
          type: 'task_assigned',
          message: `Тебя назначили на задачу "${updated.title}"`,
          link: `/boards/${updated.boardId}?task=${updated.id}`,
        });
      } else {
        void this.notify({
          userId: requestUserId,
          type: 'task_assigned',
          message: `Вы назначили себя на задачу "${updated.title}"`,
          link: `/boards/${updated.boardId}?task=${updated.id}`,
        });
      }
    }


    if (data.status && data.status !== task.status) {
      const statusLabel: Record<string, string> = {
        todo: 'Todo',
        in_progress: 'In Progress',
        done: 'Done',
      };
      const label = statusLabel[data.status] ?? data.status;
      const link = `/boards/${updated.boardId}?task=${updated.id}`;

      const isOwner = task.userId === requestUserId;
      const isAssignee = updated.assigneeId === requestUserId;

      if (isAssignee && !isOwner) {

        void this.notify({
          userId: task.userId,
          type: 'task_done',
          message: `Исполнитель перевёл задачу "${updated.title}" в ${label}`,
          link,
        });
      } else if (isOwner && updated.assigneeId && !isAssignee) {

        void this.notify({
          userId: updated.assigneeId,
          type: 'task_done',
          message: `Автор перевёл задачу "${updated.title}" в ${label}`,
          link,
        });
      } else if (!updated.assigneeId) {

        void this.notify({
          userId: task.userId,
          type: 'task_done',
          message: `Задача "${updated.title}" переведена в ${label}`,
          link,
        });
      }
    }

    this.gateway.emitTaskUpdated(updated.boardId, updated);
    return updated;
  }

  async remove(id: number, requestUserId: number, requestUserRole: string) {
    const task = await this.ensureExists(id);

    if (task.userId !== requestUserId && requestUserRole !== 'ADMIN') {

      const membership = await this.prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId: task.boardId, userId: requestUserId } },
      });
      const isBoardOwnerOrEditor =
        membership && (membership.role === 'owner' || membership.role === 'editor');

      if (!isBoardOwnerOrEditor) {
        throw new ForbiddenException('You can only delete your own tasks');
      }
    }

    void this.audit.log('task', id, 'deleted', requestUserId, `Title: "${task.title}"`);
    this.gateway.emitTaskDeleted(task.boardId, id);

    return this.prisma.task.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }
}
