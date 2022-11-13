import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { VnPayService } from './vnpay.service';

const providers = [
  SupabaseService,
  VnPayService
]

@Global()
@Module({
  providers,
  imports: [],
  exports: [SupabaseService, VnPayService]
})
export class SharedModule {}
