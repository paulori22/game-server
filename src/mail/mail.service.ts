import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter(): Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port');
    const secure = this.configService.get<boolean>('mail.secure');
    const user = this.configService.get<string>('mail.user');
    const password = this.configService.get<string>('mail.password');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth:
        user && password
          ? {
              user,
              pass: password,
            }
          : undefined,
    });

    return this.transporter;
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const from = options.from ?? this.configService.get<string>('mail.from');

    try {
      const info = await this.getTransporter().sendMail({
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(
        `Email sent to ${Array.isArray(options.to) ? options.to.join(', ') : options.to} (messageId: ${info.messageId})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
