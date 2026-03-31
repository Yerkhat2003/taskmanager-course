import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(commentId: number, userId: number, emoji: string) {
    const existing = await this.prisma.commentReaction.findUnique({
      where: { commentId_userId_emoji: { commentId, userId, emoji } },
    });

    if (existing) {
      await this.prisma.commentReaction.delete({ where: { id: existing.id } });
      return { action: 'removed', emoji };
    }

    await this.prisma.commentReaction.create({ data: { commentId, userId, emoji } });
    return { action: 'added', emoji };
  }

  findByComment(commentId: number) {
    return this.prisma.commentReaction.findMany({
      where: { commentId },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
