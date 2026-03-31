import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe,
  HttpCode, HttpStatus, UseGuards, Res, Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get('shared/:token')
  getBoardByToken(@Param('token') token: string) {
    return this.boardsService.findByShareToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getBoards(@Req() req: Request) {
    const user = (req as any).user;
    return this.boardsService.findAll(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getBoard(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = (req as any).user;
    return this.boardsService.findOne(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBoard(@Body('title') title: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.boardsService.create(title, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('from-template')
  @HttpCode(HttpStatus.CREATED)
  createFromTemplate(
    @Body('template') template: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.boardsService.createFromTemplate(template, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateBoard(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; completed?: boolean },
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.boardsService.update(id, body, user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteBoard(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/export')
  async exportExcel(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const buffer = await this.boardsService.exportExcel(id);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="board-${id}.xlsx"`);
    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  generateShare(@Param('id', ParseIntPipe) id: number) {
    return this.boardsService.generateShareToken(id);
  }
}
