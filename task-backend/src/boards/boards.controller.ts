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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from '../generated/prisma/client';

@ApiTags('Boards')
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все доски' })
  @ApiResponse({ status: 200, description: 'Список всех досок' })
  async getBoards(): Promise<Board[]> {
    return this.boardsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить доску с задачами' })
  @ApiResponse({ status: 200, description: 'Доска с включёнными задачами (include: tasks)' })
  @ApiResponse({ status: 404, description: 'Доска не найдена' })
  async getBoard(@Param('id') id: string): Promise<Board | null> {
    return this.boardsService.findOne(+id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать доску' })
  @ApiResponse({ status: 201, description: 'Доска создана' })
  async createBoard(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardsService.create(createBoardDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить доску' })
  async updateBoard(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto): Promise<Board> {
    return this.boardsService.update(+id, updateBoardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить доску' })
  @ApiResponse({ status: 204, description: 'Доска удалена' })
  async deleteBoard(@Param('id') id: string): Promise<void> {
    await this.boardsService.remove(+id);
  }
}

