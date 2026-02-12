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
import type { Board } from './board.interface';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  getBoards(): Board[] {
    return this.boardsService.findAll();
  }

  @Get(':id')
  getBoard(@Param('id') id: string): Board | undefined {
    return this.boardsService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBoard(
    @Body() createBoardDto: Omit<Board, 'id' | 'createdAt'>,
  ): Board {
    return this.boardsService.create(createBoardDto);
  }

  @Put(':id')
  updateBoard(
    @Param('id') id: string,
    @Body() updateBoardDto: Partial<Omit<Board, 'id' | 'createdAt'>>,
  ): Board | undefined {
    return this.boardsService.update(+id, updateBoardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBoard(@Param('id') id: string): void {
    this.boardsService.remove(+id);
  }
}

