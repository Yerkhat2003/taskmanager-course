import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubtasksService {
  constructor(private readonly prisma: PrismaService) {}

  findByTask(taskId: number) {
    return this.prisma.subtask.findMany({
      where: { taskId },
      orderBy: { order: 'asc' },
    });
  }

  create(taskId: number, title: string) {
    return this.prisma.subtask.create({ data: { taskId, title } });
  }

  async toggle(id: number) {
    const sub = await this.prisma.subtask.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subtask not found');
    return this.prisma.subtask.update({
      where: { id },
      data: { completed: !sub.completed },
    });
  }

  async remove(id: number) {
    const sub = await this.prisma.subtask.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subtask not found');
    return this.prisma.subtask.delete({ where: { id } });
  }
}
