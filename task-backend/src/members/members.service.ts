import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByBoard(boardId: number) {
    return this.prisma.boardMember.findMany({
      where: { boardId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async invite(boardId: number, email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException(`Пользователь с email ${email} не найден`);

    const existing = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId: user.id } },
    });
    if (existing) throw new ConflictException('Пользователь уже является участником доски');

    return this.prisma.boardMember.create({
      data: { boardId, userId: user.id, role: 'viewer' },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  }

  async updateRole(boardId: number, userId: number, role: string) {
    const allowed = ['owner', 'editor', 'viewer'];
    if (!allowed.includes(role)) {
      throw new NotFoundException(`Invalid role "${role}". Use: owner, editor, viewer`);
    }
    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member) throw new NotFoundException('Участник не найден');
    return this.prisma.boardMember.update({
      where: { id: member.id },
      data: { role },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  }

  async remove(boardId: number, userId: number) {
    const member = await this.prisma.boardMember.findUnique({
      where: { boardId_userId: { boardId, userId } },
    });
    if (!member) throw new NotFoundException('Участник не найден');
    return this.prisma.boardMember.delete({ where: { id: member.id } });
  }
}
