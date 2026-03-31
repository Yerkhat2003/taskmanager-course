import { Controller, Get, Patch, Post, Body, Req, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  getProfile(@Req() req: Request) {
    const user = req.user as any;
    return this.usersService.getProfile(user.userId);
  }

  @Patch('me')
  updateProfile(
    @Req() req: Request,
    @Body() body: { name?: string; bio?: string; avatarUrl?: string },
  ) {
    const user = req.user as any;
    return this.usersService.updateProfile(user.userId, body);
  }

  @Post('me/password')
  changePassword(
    @Req() req: Request,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    const user = req.user as any;
    return this.usersService.changePassword(user.userId, body.oldPassword, body.newPassword);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  setRole(
    @Req() req: Request,
    @Param('id', ParseIntPipe) targetId: number,
    @Body() body: { role: string },
  ) {
    const admin = req.user as any;
    return this.usersService.setRole(admin.userId, admin.role, targetId, body.role);
  }
}
