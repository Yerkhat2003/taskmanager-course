import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

<<<<<<< HEAD
  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
=======
  async findAll(): Promise<Pick<User, 'id' | 'email' | 'name' | 'role'>[]> {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
>>>>>>> 971228d7 (37)
    });
  }

  findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

<<<<<<< HEAD
  createUser(data: { email: string; name: string; passwordHash: string }) {
=======
  async findMe(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tasks: true,
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hash = await argon2.hash(createUserDto.password);
>>>>>>> 971228d7 (37)
    return this.prisma.user.create({
      data,
    });
  }
}

