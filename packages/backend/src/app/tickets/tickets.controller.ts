import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TicketsService } from './tickets.service.ts';
import { CreateTicketDto, UpdateTicketDto, TicketResponseDto } from './dto/ticket.dto.ts';
import { 
  CreateChildTicketDto, 
  HierarchyResponseDto, 
  CompletionSettingsDto, 
  MoveHierarchyDto,
  CompletionProgressResponseDto 
} from './dto/hierarchy.dto.ts';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.ts';
import { CurrentUser, type AuthenticatedUser } from '../decorators/current-user.decorator.ts';
import { HierarchyService } from './services/hierarchy.service.ts';

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly hierarchyService: HierarchyService
  ) {}

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

  // Pool-specific endpoints for Story 1.5.4
  @Post(':id/move-to-pool')
  @ApiOperation({ summary: 'Move a ticket to the pool (unschedule it)' })
  @ApiResponse({ status: 200, description: 'Ticket moved to pool successfully', type: TicketResponseDto })
  async moveTicketToPool(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    return await this.ticketsService.moveTicketToPool(user.id, id);
  }

  @Post(':id/schedule-from-pool')
  @ApiOperation({ summary: 'Schedule a ticket from the pool (move it back to timeline)' })
  @ApiResponse({ status: 200, description: 'Ticket scheduled from pool successfully', type: TicketResponseDto })
  async scheduleTicketFromPool(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() scheduleDto: { startTime: string; endTime: string }
  ) {
    const startTime = new Date(scheduleDto.startTime);
    const endTime = new Date(scheduleDto.endTime);
    return await this.ticketsService.scheduleTicketFromPool(user.id, id, startTime, endTime);
  }

  @Put(':id/reorder-in-pool')
  @ApiOperation({ summary: 'Reorder a ticket within the pool' })
  @ApiResponse({ status: 200, description: 'Ticket reordered in pool successfully', type: TicketResponseDto })
  async reorderTicketInPool(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() reorderDto: { newPosition: number }
  ) {
    return await this.ticketsService.reorderTicketInPool(user.id, id, reorderDto.newPosition);
  }

  @Get('pool')
  @ApiOperation({ summary: 'Get all tickets currently in the pool for the current user' })
  @ApiResponse({ status: 200, description: 'List of pool tickets ordered by pool position', type: [TicketResponseDto] })
  async getPoolTickets(
    @CurrentUser() user: AuthenticatedUser
  ) {
    return await this.ticketsService.getPoolTickets(user.id);
  }

  // Hierarchy endpoints for Story 2.5
  @Post(':id/children')
  @ApiOperation({ summary: 'Create a child ticket under a parent ticket' })
  @ApiResponse({ status: 201, description: 'Child ticket created successfully' })
  async createChildTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') parentId: string,
    @Body() createChildDto: CreateChildTicketDto
  ) {
    return await this.hierarchyService.createChildTicket(parentId, user.id, createChildDto);
  }

  @Get(':id/hierarchy')
  @ApiOperation({ summary: 'Get hierarchy information for a ticket including children' })
  @ApiResponse({ status: 200, description: 'Ticket hierarchy information', type: HierarchyResponseDto })
  async getTicketHierarchy(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string
  ) {
    return await this.hierarchyService.getHierarchy(ticketId, user.id);
  }

  @Put(':id/completion-settings')
  @ApiOperation({ summary: 'Update parent completion settings for a ticket' })
  @ApiResponse({ status: 200, description: 'Completion settings updated successfully' })
  async updateCompletionSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Body() settingsDto: CompletionSettingsDto
  ) {
    return await this.hierarchyService.updateCompletionSettings(ticketId, user.id, settingsDto);
  }

  @Put(':id/move-hierarchy')
  @ApiOperation({ summary: 'Move a ticket in the hierarchy (change parent or make root-level)' })
  @ApiResponse({ status: 200, description: 'Ticket moved in hierarchy successfully' })
  async moveTicketInHierarchy(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string,
    @Body() moveDto: MoveHierarchyDto
  ) {
    return await this.hierarchyService.moveTicketInHierarchy(ticketId, user.id, moveDto);
  }

  @Get(':id/completion-progress')
  @ApiOperation({ summary: 'Get completion progress for a parent ticket' })
  @ApiResponse({ status: 200, description: 'Completion progress information', type: CompletionProgressResponseDto })
  async getCompletionProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') ticketId: string
  ) {
    return await this.hierarchyService.getCompletionProgress(ticketId, user.id);
  }
}
