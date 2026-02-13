import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './board.entity';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  async getBoards(): Promise<Board[]> {
    return this.boardsService.findAll();
  }

  @Get(':id')
  async getBoard(@Param('id') id: string): Promise<Board | null> {
    return this.boardsService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBoard(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardsService.create(createBoardDto);
  }
}

