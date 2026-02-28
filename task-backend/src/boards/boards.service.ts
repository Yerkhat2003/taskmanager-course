import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from '../generated/prisma/client';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Board[]> {
    return this.prisma.board.findMany();
  }

  async findOne(id: number): Promise<Board | null> {
    return this.prisma.board.findUnique({ where: { id }, include: { tasks: true } });
  }

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    return this.prisma.board.create({ data: createBoardDto });
  }

  async update(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
    return this.prisma.board.update({ where: { id }, data: updateBoardDto });
  }

  async remove(id: number): Promise<Board> {
    return this.prisma.board.delete({ where: { id } });
  }
}

