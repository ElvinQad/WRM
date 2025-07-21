import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SupabaseAuthUser } from 'nestjs-supabase-auth';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SupabaseAuthUser => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
