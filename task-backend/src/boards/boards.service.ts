import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import * as XLSX from 'xlsx';

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: number) {
    return this.prisma.board.findMany({
      where: {
        members: { some: { userId } },
      },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tasks: true } } },
    });
  }

  async findOne(id: number, userId?: number) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
            attachments: { select: { id: true, filename: true, url: true } },
            subtasks: { orderBy: { order: 'asc' } },
            labels: { include: { label: true } },
            _count: { select: { comments: true } },
          },
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        },
      },
    });
    if (!board) throw new NotFoundException('Board not found');

    if (userId !== undefined) {
      const isMember = await this.prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId: id, userId } },
      });
      if (!isMember) throw new NotFoundException('Board not found');
    }

    return board;
  }

  async create(title: string, userId: number) {
    const board = await this.prisma.board.create({ data: { title } });

    await this.prisma.boardMember.create({
      data: { boardId: board.id, userId, role: 'owner' },
    });
    return board;
  }

  async update(id: number, data: { title?: string; completed?: boolean }, requestUserId?: number) {
    await this.ensureExists(id);
    const updated = await this.prisma.board.update({ where: { id }, data });

    if (data.completed === true) {
      const tasks = await this.prisma.task.findMany({
        where: { boardId: id },
        select: { userId: true, assigneeId: true },
      });
      const recipients = new Set<number>();
      for (const t of tasks) {
        if (t.userId !== requestUserId) recipients.add(t.userId);
        if (t.assigneeId && t.assigneeId !== requestUserId) recipients.add(t.assigneeId);
      }
      for (const userId of recipients) {
        void this.prisma.notification.create({
          data: {
            userId,
            type: 'board_completed',
            message: `Доска "${updated.title}" была завершена`,
            link: `/boards/${id}`,
          },
        });
      }
    }

    return updated;
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.board.delete({ where: { id } });
  }

  async exportExcel(id: number): Promise<Buffer> {
    const board = await this.findOne(id);

    const rows = (board.tasks as any[]).map((t) => ({
      ID: t.id,
      Название: t.title,
      Описание: t.description || '',
      Статус: t.status === 'todo' ? 'К выполнению' : t.status === 'in_progress' ? 'В процессе' : 'Готово',
      Приоритет: t.priority === 'low' ? 'Низкий' : t.priority === 'high' ? 'Высокий' : 'Средний',
      Дедлайн: t.dueDate ? new Date(t.dueDate).toLocaleDateString('ru-RU') : '',
      Исполнитель: t.assignee?.name ?? '',
      Автор: t.user?.name ?? '',
      Создано: new Date(t.createdAt).toLocaleDateString('ru-RU'),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    ws['!cols'] = [
      { wch: 6 },
      { wch: 30 },
      { wch: 40 },
      { wch: 14 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, board.title.slice(0, 31));

    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
  }

  async generateShareToken(id: number) {
    await this.ensureExists(id);
    const shareToken = randomUUID();
    await this.prisma.board.update({ where: { id }, data: { shareToken } });
    return { token: shareToken };
  }

  async findByShareToken(token: string) {
    const board = await this.prisma.board.findUnique({
      where: { shareToken: token },
      include: {
        tasks: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!board) throw new NotFoundException('Board not found or link expired');
    return board;
  }

  async createFromTemplate(template: string, userId: number) {
    const templates: Record<string, { title: string; tasks: { title: string; status: string; priority: string }[] }> = {
      sprint: {
        title: 'Sprint Board',
        tasks: [
          { title: 'Планирование спринта', status: 'todo', priority: 'high' },
          { title: 'Разработка фичи A', status: 'todo', priority: 'high' },
          { title: 'Разработка фичи B', status: 'in_progress', priority: 'medium' },
          { title: 'Code review', status: 'todo', priority: 'medium' },
          { title: 'Тестирование', status: 'todo', priority: 'medium' },
          { title: 'Деплой', status: 'todo', priority: 'low' },
          { title: 'Ретроспектива', status: 'todo', priority: 'low' },
        ],
      },
      roadmap: {
        title: 'Product Roadmap',
        tasks: [
          { title: 'Исследование рынка', status: 'done', priority: 'high' },
          { title: 'MVP разработка', status: 'in_progress', priority: 'high' },
          { title: 'Бета-тестирование', status: 'todo', priority: 'high' },
          { title: 'Маркетинговая кампания', status: 'todo', priority: 'medium' },
          { title: 'Публичный релиз', status: 'todo', priority: 'high' },
          { title: 'Сбор обратной связи', status: 'todo', priority: 'medium' },
        ],
      },
      bugtracker: {
        title: 'Bug Tracker',
        tasks: [
          { title: '[CRITICAL] Приложение падает при входе', status: 'in_progress', priority: 'high' },
          { title: '[HIGH] Не сохраняются настройки пользователя', status: 'todo', priority: 'high' },
          { title: '[MEDIUM] Неправильная дата в уведомлениях', status: 'todo', priority: 'medium' },
          { title: '[LOW] Опечатка в тексте кнопки', status: 'todo', priority: 'low' },
          { title: '[HIGH] Сломана пагинация на мобильных', status: 'todo', priority: 'high' },
        ],
      },
    };

    const tpl = templates[template];
    if (!tpl) throw new NotFoundException(`Шаблон "${template}" не найден`);

    const board = await this.prisma.board.create({ data: { title: tpl.title } });
    await this.prisma.boardMember.create({
      data: { boardId: board.id, userId, role: 'owner' },
    });

    for (let i = 0; i < tpl.tasks.length; i++) {
      const t = tpl.tasks[i];
      await this.prisma.task.create({
        data: {
          boardId: board.id,
          userId,
          title: t.title,
          status: t.status,
          priority: t.priority,
          order: i,
        },
      });
    }

    return this.findOne(board.id);
  }

  private async ensureExists(id: number) {
    const board = await this.prisma.board.findUnique({ where: { id } });
    if (!board) throw new NotFoundException('Board not found');
  }
}
