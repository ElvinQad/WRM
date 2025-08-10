import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { Prisma } from '@prisma/client';
import { TimelineCacheService } from './timeline-cache.service.ts';
import { MonitorDatabasePerformance } from './performance-monitor.decorator.ts';
import { 
  TimelineResponseDto, 
  TicketWithPositionDto, 
  TimelineConflictDto,
  TimelineViewDto
} from './dto/timeline.dto.ts';

@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);

  constructor(
    private prisma: PrismaService,
    private cacheService: TimelineCacheService
  ) {}

  @MonitorDatabasePerformance()
  async getTimelineData(
    userId: string, 
    view: 'daily' | 'weekly', 
    startDate: Date, 
    endDate: Date
  ): Promise<TimelineResponseDto> {
    const startTime = performance.now();
    
    // Check cache first
    const cacheKey = this.cacheService.generateTimelineKey(userId, view, startDate, endDate);
    const cachedResult = this.cacheService.get<TimelineResponseDto>(cacheKey);
    
    if (cachedResult.cached) {
      this.logger.log(`Cache hit for timeline query: ${cacheKey}`);
      // Update performance metrics to reflect cache hit
      const cachedData = cachedResult.data;
      cachedData.performance.cached = true;
      cachedData.performance.queryTime = 0; // Cached response is essentially instant
      cachedData.performance.cacheInfo = this.cacheService.getCacheInfo(cacheKey);
      return cachedData;
    }
    
    // Build optimized query with date range filters and indexing
    const whereClause: Prisma.TicketWhereInput = {
      userId,
      OR: [
        // Tickets that start within the date range
        {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        // Tickets that end within the date range
        {
          endTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        // Tickets that span the entire date range (start before, end after)
        {
          AND: [
            { startTime: { lte: startDate } },
            { endTime: { gte: endDate } },
          ],
        },
      ],
    };

    // Execute optimized query with minimal data selection
    const tickets = await this.prisma.ticket.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        typeId: true,
        customProperties: true,
        ticketType: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { startTime: 'asc' },
        { endTime: 'asc' },
      ],
    });

    const queryTime = performance.now() - startTime;

    // Calculate timeline positioning
    const ticketsWithPosition = this.calculateTicketPositions(tickets, view, startDate, endDate);
    
    // Detect conflicts
    const conflicts = this.detectConflicts(ticketsWithPosition);

    // Calculate view parameters
    const viewInfo = this.calculateViewInfo(view, startDate, endDate);

    const response: TimelineResponseDto = {
      tickets: ticketsWithPosition,
      conflicts,
      view: viewInfo,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      performance: {
        queryTime: Math.round(queryTime * 100) / 100, // Round to 2 decimal places
        ticketCount: tickets.length,
        cached: false,
        cacheInfo: {
          hit: false,
          key: cacheKey,
        },
      },
    };

    // Cache the response (5 minute TTL for timeline data)
    this.cacheService.set(cacheKey, response, 5 * 60 * 1000);

    this.logger.log(`Timeline query completed in ${queryTime.toFixed(2)}ms for ${tickets.length} tickets`);
    
    return response;
  }

  private calculateTicketPositions(
    tickets: Array<{
      id: string;
      title: string;
      startTime: Date;
      endTime: Date;
      typeId: string;
      customProperties: Prisma.JsonValue;
      ticketType: { name: string } | null;
    }>,
    view: 'daily' | 'weekly',
    startDate: Date,
    endDate: Date
  ): TicketWithPositionDto[] {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    const rangeMs = endTime - startTime;
    const rangeMinutes = rangeMs / (1000 * 60);

    // Calculate pixels per minute based on view
    let pixelsPerMinute: number;
    switch (view) {
      case 'daily':
        pixelsPerMinute = Math.max(3, 600 / rangeMinutes);
        break;
      case 'weekly':
        pixelsPerMinute = Math.max(1, 150 / rangeMinutes);
        break;
      default:
        pixelsPerMinute = 2;
    }

    const positioned: TicketWithPositionDto[] = [];
    const sortedTickets = [...tickets].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    for (const ticket of sortedTickets) {
      const ticketStartTime = ticket.startTime.getTime();
      const ticketEndTime = ticket.endTime.getTime();
      
      const startX = this.timeToPixels(ticketStartTime, startTime, pixelsPerMinute);
      const endX = this.timeToPixels(ticketEndTime, startTime, pixelsPerMinute);
      const width = Math.max(endX - startX, 20); // Minimum width

      // Find the lowest available lane
      let lane = 0;
      let foundConflict = true;

      while (foundConflict) {
        foundConflict = false;
        for (const positionedTicket of positioned) {
          if (positionedTicket.lane === lane && 
              this.timeRangesOverlap(
                ticketStartTime, 
                ticketEndTime,
                new Date(positionedTicket.startTime).getTime(),
                new Date(positionedTicket.startTime).getTime() + (positionedTicket.width / pixelsPerMinute * 60 * 1000)
              )) {
            foundConflict = true;
            break;
          }
        }
        if (foundConflict) {
          lane++;
        }
      }

      const customProps = ticket.customProperties as Record<string, unknown> || {};

      positioned.push({
        id: ticket.id,
        title: ticket.title,
        startTime: ticket.startTime.toISOString(),
        endTime: ticket.endTime.toISOString(),
        typeId: ticket.typeId,
        lane,
        startX,
        width,
        customProperties: customProps,
        typeName: ticket.ticketType?.name,
        color: customProps.color as string || '#f0f0f0',
      });
    }

    return positioned;
  }

  private detectConflicts(tickets: TicketWithPositionDto[]): TimelineConflictDto[] {
    const conflicts: TimelineConflictDto[] = [];
    
    for (let i = 0; i < tickets.length; i++) {
      for (let j = i + 1; j < tickets.length; j++) {
        const ticket1 = tickets[i];
        const ticket2 = tickets[j];
        
        const start1 = new Date(ticket1.startTime).getTime();
        const end1 = new Date(ticket1.endTime).getTime();
        const start2 = new Date(ticket2.startTime).getTime();
        const end2 = new Date(ticket2.endTime).getTime();
        
        if (this.timeRangesOverlap(start1, end1, start2, end2)) {
          conflicts.push({
            ticketIds: [ticket1.id, ticket2.id],
            type: 'overlap',
            severity: 'warning',
          });
        }
      }
    }

    return conflicts;
  }

  private calculateViewInfo(view: 'daily' | 'weekly', startDate: Date, endDate: Date): TimelineViewDto {
    const rangeMs = endDate.getTime() - startDate.getTime();
    const rangeMinutes = rangeMs / (1000 * 60);

    let pixelsPerMinute: number;
    switch (view) {
      case 'daily':
        pixelsPerMinute = Math.max(3, 600 / rangeMinutes);
        break;
      case 'weekly':
        pixelsPerMinute = Math.max(1, 150 / rangeMinutes);
        break;
      default:
        pixelsPerMinute = 2;
    }

    const totalWidth = Math.max(800, rangeMinutes * pixelsPerMinute);

    return {
      type: view,
      pixelsPerMinute,
      totalWidth,
    };
  }

  private timeToPixels(time: number, startTime: number, pixelsPerMinute: number): number {
    return ((time - startTime) / (1000 * 60)) * pixelsPerMinute;
  }

  private timeRangesOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
    return start1 < end2 && start2 < end1;
  }
}
