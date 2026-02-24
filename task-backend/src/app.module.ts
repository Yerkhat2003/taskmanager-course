import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BoardsModule } from './boards/boards.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BoardsModule,
    TasksModule,
    UsersModule,
  ],
})
export class AppModule {}
