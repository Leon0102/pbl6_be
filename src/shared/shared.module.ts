import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NotificationsService } from './notification.service';
import { SupabaseService } from './supabase.service';
import { VnPayService } from './vnpay.service';

const providers = [SupabaseService, VnPayService, MailService, NotificationsService];

@Global()
@Module({
  providers,
  imports: [],
  exports: [SupabaseService, VnPayService, MailService, NotificationsService],
})
export class SharedModule {}
