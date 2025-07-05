import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseService } from './supabase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly supabaseService: SupabaseService
  ) {}

  @Get('test-supabase')
  async testSupabase() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('test_table').select('*');
    
    if (error) {
      return { error: error.message };
    }
    
    return { data };
  }
}
