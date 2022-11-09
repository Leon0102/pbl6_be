import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';


@Injectable()
export class SupabaseService {
  supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  // upload file to supabase and get url width row-lvel security
  async uploadFile(file: Express.Multer.File) {
    // generate random string for file name
    const fileName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
    return process.env.SUPABASE_URL + '/storage/v1/object/public/storage/' + data.path;
  }

  // delete file from supabase
  async deleteFile(url: string) {
    const { error } = await this.supabase.storage
      .from('storage')
      .remove([url.replace(process.env.SUPABASE_URL + '/storage/v1/object/public/storage/', '')]);
    if (error) {
      throw new Error(error.message);
    }
  }
}
