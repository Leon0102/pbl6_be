import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CREATE_RESERVATION, FORGOT_PASSWORD_OTP_EMAIL } from './templates';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService
  ) {}

  async mailConfig() {
    return {
      transport: {
        host: this.config.get('MAIL_HOST'),
        port: this.config.get('MAIL_PORT'),
        secure: this.config.get('MAIL_SECURE'),
        auth: {
          user: this.config.get('MAIL_USER'),
          pass: this.config.get('MAIL_PASS'),
        }
      }
    };
  }

  async sendEmailReservation(to: string, subject: string, context: any) {
    const { username, property, checkIn, checkOut, guestCount, totalPrice } = context;
    return this.mailerService.sendMail({
      to,
      from: this.config.get('MAIL_FROM'),
      subject,
      html: CREATE_RESERVATION.template(username, property, checkIn, checkOut, guestCount, totalPrice)
    });
  }

  async sendEmailOTP(to: string, subject: string, context: any) {
    const { username, otpCode } = context;
    return this.mailerService.sendMail({
      to,
      from: this.config.get('MAIL_FROM'),
      subject,
      html: FORGOT_PASSWORD_OTP_EMAIL.template(username, otpCode)
    });
  }


}
