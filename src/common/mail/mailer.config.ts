import { MailerOptions } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export const mailerConfig: MailerOptions = {
  transport: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  defaults: {
    from: process.env.MAIL_FROM || 'no-reply@example.com',
  },
  template: {
    dir: join(__dirname, '../templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
