import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  findAll(): Promise<Board[]> {
    return this.boardRepository.find();
  }

  findOne(id: number): Promise<Board | null> {
    return this.boardRepository.findOne({ where: { id } });
  }

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = this.boardRepository.create(createBoardDto);
    return this.boardRepository.save(board);
  }
}

