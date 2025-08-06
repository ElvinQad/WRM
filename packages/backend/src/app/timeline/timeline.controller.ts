import { Controller, Get, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.ts';
import { CurrentUser, type AuthenticatedUser } from '../decorators/current-user.decorator.ts';
import { TimelineService } from './timeline.service.ts';
import { TimelineResponseDto } from './dto/timeline.dto.ts';

@ApiTags('Timeline')
@Controller('timeline')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get timeline data with selective loading',
    description: 'Retrieves timeline data for specific date ranges with optimized performance for daily and weekly views'
  })
  @ApiResponse({ status: 200, description: 'Timeline data', type: TimelineResponseDto })
  @ApiQuery({ name: 'view', enum: ['daily', 'weekly'], description: 'Timeline view mode' })
  @ApiQuery({ name: 'start', type: 'string', description: 'Start date (ISO string)', example: '2025-08-06T00:00:00.000Z' })
  @ApiQuery({ name: 'end', type: 'string', description: 'End date (ISO string)', example: '2025-08-08T00:00:00.000Z' })
  async getTimelineData(
    @CurrentUser() user: AuthenticatedUser,
    @Query('view') view: 'daily' | 'weekly',
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    if (!view || !start || !end) {
      throw new BadRequestException('view, start, and end parameters are required');
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO 8601 format.');
    }

    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validate date range size to prevent excessive queries
    const rangeDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const maxDays = view === 'daily' ? 7 : 30; // Allow up to 7 days for daily, 30 for weekly
    
    if (rangeDays > maxDays) {
      throw new BadRequestException(`Date range too large. Maximum ${maxDays} days allowed for ${view} view.`);
    }

    return await this.timelineService.getTimelineData(user.id, view, startDate, endDate);
  }
}
