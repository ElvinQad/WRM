import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service.ts';
import { CreateTicketDto, UpdateTicketDto, TicketResponseDto } from './dto/ticket.dto.ts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.ts';
import { CurrentUser, type AuthenticatedUser } from '../decorators/current-user.decorator.ts';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tickets for the current user with optional date range filtering' })
  @ApiResponse({ status: 200, description: 'List of tickets', type: [TicketResponseDto] })
  async getTickets(
    @CurrentUser() user: AuthenticatedUser,
    @Query('start') start?: string,
    @Query('end') end?: string
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    
    return await this.ticketsService.getTickets(user.id, startDate, endDate);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully', type: TicketResponseDto })
  async createTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createTicketDto: CreateTicketDto
  ) {
    return await this.ticketsService.createTicket(user.id, createTicketDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific ticket' })
  @ApiResponse({ status: 200, description: 'Ticket details', type: TicketResponseDto })
  async getTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    return await this.ticketsService.getTicketById(user.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully', type: TicketResponseDto })
  async updateTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto
  ) {
    return await this.ticketsService.updateTicket(user.id, id, updateTicketDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  async deleteTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    return await this.ticketsService.deleteTicket(user.id, id);
  }
}
