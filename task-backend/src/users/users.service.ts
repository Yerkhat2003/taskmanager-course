import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ include: { tasks: true } });
  }

  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: { tasks: true },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prisma.user.create({ data: createUserDto });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async remove(id: number): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
