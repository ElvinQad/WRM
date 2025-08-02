import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.ts';
import { CurrentUser, type AuthenticatedUser } from '../decorators/current-user.decorator.ts';
import { TicketTypesService } from './ticket-types.service.ts';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ticket-types')
@ApiBearerAuth()
@Controller('ticket-types')
@UseGuards(JwtAuthGuard)
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List of ticket types' })
  async getTicketTypes(@CurrentUser() user: AuthenticatedUser) {
    console.log('User object:', user);
    console.log('User ID:', user.id);
    console.log('User ID type:', typeof user.id);
    return await this.ticketTypesService.getTicketTypes(user.id);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Ticket type details' })
  async getTicketType(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return await this.ticketTypesService.getTicketType(id, user.id);
  }
}
