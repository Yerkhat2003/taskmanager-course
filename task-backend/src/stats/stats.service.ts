import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      usersCount,
      totalBoards,
      activeBoards,
      completedBoards,
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      recentBoards,
      recentUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.board.count(),
      this.prisma.board.count({ where: { completed: false } }),
      this.prisma.board.count({ where: { completed: true } }),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: 'todo' } }),
      this.prisma.task.count({ where: { status: 'in_progress' } }),
      this.prisma.task.count({ where: { status: 'done' } }),
      this.prisma.board.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { tasks: true } } },
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

    return {
      users: { total: usersCount },
      boards: {
        total: totalBoards,
        active: activeBoards,
        completed: completedBoards,
      },
      tasks: {
        total: totalTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
      },
      recentBoards,
      recentUsers,
    };
  }
}
