import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendTaskAssigned(to: string, taskTitle: string, boardLink: string) {
    if (!process.env.SMTP_USER) return;
    try {
      await this.transporter.sendMail({
        from: `"TaskNest" <${process.env.SMTP_USER}>`,
        to,
        subject: `Вам назначена задача: ${taskTitle}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px">
            <h2 style="color:#6366f1">TaskNest</h2>
            <p>Вам назначена новая задача: <strong>${taskTitle}</strong></p>
            <a href="${boardLink}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none">
              Открыть задачу
            </a>
          </div>`,
      });
    } catch (err) {
      this.logger.error(`Email send failed: ${(err as Error).message}`);
    }
  }

  async sendDeadlineReminder(to: string, taskTitle: string, dueDate: Date, boardLink: string) {
    if (!process.env.SMTP_USER) return;
    try {
      await this.transporter.sendMail({
        from: `"TaskNest" <${process.env.SMTP_USER}>`,
        to,
        subject: `⏰ Дедлайн через 24 часа: ${taskTitle}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px">
            <h2 style="color:#6366f1">TaskNest</h2>
            <p>Дедлайн задачи <strong>${taskTitle}</strong> через 24 часа.</p>
            <p style="color:#ef4444">Срок: ${dueDate.toLocaleString('ru-RU')}</p>
            <a href="${boardLink}" style="display:inline-block;padding:10px 20px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none">
              Открыть задачу
            </a>
          </div>`,
      });
    } catch (err) {
      this.logger.error(`Email send failed: ${(err as Error).message}`);
    }
  }
}
