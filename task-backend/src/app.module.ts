import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BoardsModule } from './boards/boards.module';
import { TasksModule } from './tasks/tasks.module';
import { StatsModule } from './stats/stats.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { UploadModule } from './upload/upload.module';
import { GatewaysModule } from './gateways/gateways.module';
import { DeadlineModule } from './deadline/deadline.module';
import { ReactionsModule } from './reactions/reactions.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { LabelsModule } from './labels/labels.module';
import { MembersModule } from './members/members.module';
import { TimerModule } from './timer/timer.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    UsersModule,
    BoardsModule,
    TasksModule,
    StatsModule,
    AuthModule,
    CommentsModule,
    NotificationsModule,
    AuditModule,
    UploadModule,
    GatewaysModule,
    DeadlineModule,
    ReactionsModule,
    SubtasksModule,
    LabelsModule,
    MembersModule,
    TimerModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
