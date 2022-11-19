import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  supabase: any;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      configService.get('SUPABASE_URL'),
      configService.get('SUPABASE_KEY'),
    );
  }

  // upload file to supabase and get url width row-lvel security
  async uploadFile(file: Express.Multer.File) {
    // generate random string for file name
    const fileName =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    const { data, error } = await this.supabase.storage
      .from('storage')
      .upload(`storage/${fileName}`, file.buffer, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) {
      throw new Error(error.message);
    }
    // return url of uploaded file
    return (
      this.configService.get('SUPABASE_URL') +
      '/storage/v1/object/public/storage/' +
      data.path
    );
  }

  // delete file from supabase
  async deleteFile(url: string) {
    const { error } = await this.supabase.storage
      .from('storage')
      .remove([
        url.replace(
          this.configService.get('SUPABASE_URL') + '/storage/v1/object/public/storage/',
          '',
        ),
      ]);
    if (error) {
      throw new Error(error.message);
    }
  }
}
