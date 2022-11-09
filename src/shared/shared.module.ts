import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

const providers = [
  SupabaseService,
]

@Global()
@Module({
  providers,
  imports: [],
  exports: [SupabaseService]
})
export class SharedModule {}
