import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from '../generated/prisma/client';

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

  @Put(':id')
  async updateBoard(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto): Promise<Board> {
    return this.boardsService.update(+id, updateBoardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBoard(@Param('id') id: string): Promise<void> {
    await this.boardsService.remove(+id);
  }
}

