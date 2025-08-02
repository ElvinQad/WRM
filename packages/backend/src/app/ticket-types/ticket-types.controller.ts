import { Controller, Get, Post, Put, Body, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.ts';
import { CurrentUser, type AuthenticatedUser } from '../decorators/current-user.decorator.ts';
import { TicketTypesService } from './ticket-types.service.ts';
import { CreateTicketTypeDto, UpdateTicketTypeDto } from './dto/create-ticket-type.dto.ts';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('ticket-types')
@ApiBearerAuth()
@Controller('ticket-types')
@UseGuards(JwtAuthGuard)
export class TicketTypesController {
  constructor(private readonly ticketTypesService: TicketTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all ticket types for the current user' })
  @ApiResponse({ status: 200, description: 'List of ticket types' })
  async getTicketTypes(@CurrentUser() user: AuthenticatedUser) {
    console.log('User object:', user);
    console.log('User ID:', user.id);
    console.log('User ID type:', typeof user.id);
    return await this.ticketTypesService.getTicketTypes(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ticket type' })
  @ApiResponse({ status: 201, description: 'Ticket type created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate name' })
  async createTicketType(
    @Body() createTicketTypeDto: CreateTicketTypeDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    try {
      return await this.ticketTypesService.createTicketType(createTicketTypeDto, user.id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new BadRequestException('A ticket type with this name already exists');
      }
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ticket type' })
  @ApiResponse({ status: 200, description: 'Ticket type updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate name' })
  @ApiResponse({ status: 404, description: 'Ticket type not found' })
  async updateTicketType(
    @Param('id') id: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    try {
      return await this.ticketTypesService.updateTicketType(id, updateTicketTypeDto, user.id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        throw new BadRequestException('A ticket type with this name already exists');
      }
      throw error;
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Ticket type details' })
  async getTicketType(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return await this.ticketTypesService.getTicketType(id, user.id);
  }
}
