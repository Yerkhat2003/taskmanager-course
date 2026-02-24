import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '../generated/prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Task[]> {
    return this.prisma.task.findMany({ include: { board: true, user: true } });
  }

  async findOne(id: number): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: { board: true, user: true },
    });
  }

  async findByBoardId(boardId: number): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { boardId },
      include: { user: true },
    });
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status ?? 'todo',
        boardId: createTaskDto.boardId,
        userId: createTaskDto.userId,
      },
    });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    return this.prisma.task.update({ where: { id }, data: updateTaskDto });
  }

  async remove(id: number): Promise<Task> {
    return this.prisma.task.delete({ where: { id } });
  }
}
