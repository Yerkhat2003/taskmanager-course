import { Module } from '@nestjs/common';
import { DeadlineService } from './deadline.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [NotificationsModule, EmailModule],
  providers: [DeadlineService],
})
export class DeadlineModule {}
