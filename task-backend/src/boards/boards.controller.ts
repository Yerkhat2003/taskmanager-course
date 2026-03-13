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
<<<<<<< HEAD
import type { Board } from './board.interface';
=======
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from '../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
>>>>>>> 971228d7 (37)

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
<<<<<<< HEAD
  createBoard(
    @Body() createBoardDto: Omit<Board, 'id' | 'createdAt'>,
  ): Board {
=======
  @ApiOperation({ summary: 'Создать доску' })
  @ApiResponse({ status: 201, description: 'Доска создана' })
  @Roles(Role.ADMIN)
  async createBoard(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
>>>>>>> 971228d7 (37)
    return this.boardsService.create(createBoardDto);
  }

  @Put(':id')
<<<<<<< HEAD
  updateBoard(
    @Param('id') id: string,
    @Body() updateBoardDto: Partial<Omit<Board, 'id' | 'createdAt'>>,
  ): Board | undefined {
=======
  @ApiOperation({ summary: 'Обновить доску' })
  @Roles(Role.ADMIN)
  async updateBoard(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto): Promise<Board> {
>>>>>>> 971228d7 (37)
    return this.boardsService.update(+id, updateBoardDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
<<<<<<< HEAD
  deleteBoard(@Param('id') id: string): void {
    this.boardsService.remove(+id);
=======
  @ApiOperation({ summary: 'Удалить доску' })
  @ApiResponse({ status: 204, description: 'Доска удалена' })
  @Roles(Role.ADMIN)
  async deleteBoard(@Param('id') id: string): Promise<void> {
    await this.boardsService.remove(+id);
>>>>>>> 971228d7 (37)
  }
}

