import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '../generated/prisma/client';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: string): Promise<Task[]> {
    const where = status
      ? { status: status as 'todo' | 'in_progress' | 'done' }
      : {};
    return this.prisma.task.findMany({
      where,
      include: { board: true, user: true },
    });
  }

  async findOne(id: number): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByBoardId(
    boardId: number,
    status?: string,
  ): Promise<Task[]> {
    const where: { boardId: number; status?: 'todo' | 'in_progress' | 'done' } = {
      boardId,
    };
    if (status) {
      where.status = status as 'todo' | 'in_progress' | 'done';
    }
    return this.prisma.task.findMany({
      where,
      include: { user: true },
    });
  }

  async create(
    createTaskDto: CreateTaskDto,
    userId: number,
  ): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        status: createTaskDto.status ?? 'todo',
        boardId: createTaskDto.boardId,
        userId,
      },
    });
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
    userRole: Role,
  ): Promise<Task> {
    const existing = await this.prisma.task.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    if (userRole !== Role.ADMIN && existing.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this task');
    }

    // не позволяем менять владельца через DTO
    const { userId: _ignoredUserId, ...data } = updateTaskDto;

    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, userId: number, userRole: Role): Promise<Task> {
    const existing = await this.prisma.task.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    if (userRole !== Role.ADMIN && existing.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this task');
    }

    return this.prisma.task.delete({ where: { id } });
  }
}
