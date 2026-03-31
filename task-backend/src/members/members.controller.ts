import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(@Param('boardId', ParseIntPipe) boardId: number) {
    return this.membersService.findByBoard(boardId);
  }

  @Post()
  invite(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Body('email') email: string,
  ) {
    return this.membersService.invite(boardId, email);
  }

  @Patch(':userId/role')
  updateRole(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body('role') role: string,
  ) {
    return this.membersService.updateRole(boardId, userId, role);
  }

  @Delete(':userId')
  remove(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.membersService.remove(boardId, userId);
  }
}
