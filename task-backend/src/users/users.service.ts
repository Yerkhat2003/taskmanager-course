import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
      orderBy: { name: 'asc' },
    });
  }

  createUser(data: { email: string; name: string; passwordHash: string }) {
    return this.prisma.user.create({ data });
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, bio: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: number, data: { name?: string; bio?: string; avatarUrl?: string }) {
    await this.ensureExists(id);
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, bio: true, avatarUrl: true },
    });
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await argon2.verify(user.passwordHash, oldPassword);
    if (!valid) throw new BadRequestException('Old password is incorrect');

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { message: 'Password changed successfully' };
  }

  async setRole(adminId: number, adminRole: string, targetId: number, newRole: string) {
    if (adminId === targetId) {
      throw new BadRequestException('Cannot change your own role');
    }

    const allowed = ['USER', 'ADMIN', 'SUPERADMIN'];
    if (!allowed.includes(newRole)) {
      throw new BadRequestException('Invalid role');
    }

    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('User not found');

    if (adminRole === 'ADMIN') {
      if (newRole === 'SUPERADMIN') {
        throw new ForbiddenException('ADMIN cannot assign SUPERADMIN role');
      }
      if (target.role === 'SUPERADMIN') {
        throw new ForbiddenException('ADMIN cannot change SUPERADMIN role');
      }
    }

    return this.prisma.user.update({
      where: { id: targetId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  private async ensureExists(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
  }
}
