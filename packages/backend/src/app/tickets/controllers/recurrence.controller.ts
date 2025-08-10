import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.ts';
import { RecurrenceService } from '../services/recurrence.service.ts';
import { CreateRecurrenceDto, UpdateRecurrenceDto, RecurrenceResponseDto } from '../dto/recurrence.dto.ts';

interface AuthenticatedRequest {
  user: {
    userId: string;
  };
}

@Controller('tickets/recurrence')
@UseGuards(JwtAuthGuard)
export class RecurrenceController {
  constructor(private readonly recurrenceService: RecurrenceService) {}

  @Post(':id')
  @HttpCode(HttpStatus.CREATED)
  createRecurrence(
    @Param('id') ticketId: string,
    @Request() req: AuthenticatedRequest,
    @Body() createRecurrenceDto: CreateRecurrenceDto,
  ): Promise<RecurrenceResponseDto> {
    return this.recurrenceService.createRecurrence(ticketId, req.user.userId, createRecurrenceDto);
  }

  @Put(':id')
  updateRecurrence(
    @Param('id') ticketId: string,
    @Request() req: AuthenticatedRequest,
    @Body() updateRecurrenceDto: UpdateRecurrenceDto,
  ): Promise<RecurrenceResponseDto> {
    return this.recurrenceService.updateRecurrence(ticketId, req.user.userId, updateRecurrenceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRecurrence(
    @Param('id') ticketId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.recurrenceService.deleteRecurrence(ticketId, req.user.userId);
  }

  @Get(':id')
  getRecurrence(
    @Param('id') ticketId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<RecurrenceResponseDto> {
    return this.recurrenceService.getRecurrence(ticketId, req.user.userId);
  }

  @Post(':id/detach')
  @HttpCode(HttpStatus.NO_CONTENT)
  detachInstance(
    @Param('id') ticketId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.recurrenceService.detachInstance(ticketId, req.user.userId);
  }

  @Post(':id/generate-instances')
  generateInstances(
    @Param('id') ticketId: string,
    @Request() req: AuthenticatedRequest,
    @Body() body: { count?: number } = {},
  ) {
    const count = body.count || 10;
    return this.recurrenceService.generateInstances(ticketId, req.user.userId, count);
  }

  @Post(':id/generate-next')
  @HttpCode(HttpStatus.CREATED)
  generateNextInstance(
    @Param('id') ticketId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.recurrenceService.generateNextInstance(ticketId, req.user.userId);
  }
}
