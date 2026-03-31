import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LabelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(boardId?: number) {
    return this.prisma.label.findMany({
      where: boardId ? { OR: [{ boardId }, { boardId: null }] } : undefined,
    });
  }

  create(name: string, color: string, boardId?: number) {
    return this.prisma.label.create({ data: { name, color, boardId } });
  }

  async addToTask(taskId: number, labelId: number) {
    return this.prisma.taskLabel.upsert({
      where: { taskId_labelId: { taskId, labelId } },
      create: { taskId, labelId },
      update: {},
    });
  }

  async removeFromTask(taskId: number, labelId: number) {
    return this.prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }
}
