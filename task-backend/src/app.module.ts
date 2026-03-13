import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
<<<<<<< HEAD
import { AppController } from './app.controller';
import { AppService } from './app.service';
=======
import { APP_GUARD } from '@nestjs/core';
>>>>>>> 971228d7 (37)
import { BoardsModule } from './boards/boards.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BoardsModule,
    AuthModule,
  ],
<<<<<<< HEAD
  controllers: [AppController],
  providers: [AppService],
=======
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
>>>>>>> 971228d7 (37)
})
export class AppModule {}
