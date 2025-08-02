import { Module } from '@nestjs/common';
import { EmailService } from './email.service.ts';

@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
