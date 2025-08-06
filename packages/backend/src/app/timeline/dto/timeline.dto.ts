import { IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TimelineResponseDto {
  @ApiProperty({ description: 'Timeline tickets with positioning', type: 'array' })
  tickets!: TicketWithPositionDto[];

  @ApiProperty({ description: 'Timeline conflicts detected', type: 'array' })
  conflicts!: TimelineConflictDto[];

  @ApiProperty({ description: 'Timeline view information' })
  view!: TimelineViewDto;

  @ApiProperty({ description: 'Date range for this timeline data' })
  dateRange!: DateRangeDto;

  @ApiProperty({ description: 'Performance metrics' })
  performance!: PerformanceMetricsDto;
}

export class TicketWithPositionDto {
  @ApiProperty({ description: 'Ticket ID' })
  id!: string;

  @ApiProperty({ description: 'Ticket title' })
  title!: string;

  @ApiProperty({ description: 'Start time (ISO string)' })
  startTime!: string;

  @ApiProperty({ description: 'End time (ISO string)' })
  endTime!: string;

  @ApiProperty({ description: 'Ticket type ID' })
  typeId!: string;

  @ApiProperty({ description: 'Timeline lane assignment' })
  lane!: number;

  @ApiProperty({ description: 'X position in pixels' })
  startX!: number;

  @ApiProperty({ description: 'Width in pixels' })
  width!: number;

  @ApiPropertyOptional({ description: 'Custom properties' })
  customProperties?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Ticket type name' })
  typeName?: string;

  @ApiPropertyOptional({ description: 'Color for display' })
  color?: string;
}

export class TimelineConflictDto {
  @ApiProperty({ description: 'Conflicting ticket IDs', type: [String] })
  ticketIds!: string[];

  @ApiProperty({ description: 'Conflict type' })
  type!: 'overlap' | 'lane_conflict';

  @ApiProperty({ description: 'Conflict severity' })
  severity!: 'warning' | 'error';
}

export class TimelineViewDto {
  @ApiProperty({ description: 'View type', enum: ['daily', 'weekly'] })
  @IsEnum(['daily', 'weekly'])
  type!: 'daily' | 'weekly';

  @ApiProperty({ description: 'Pixels per minute ratio' })
  pixelsPerMinute!: number;

  @ApiProperty({ description: 'Total timeline width in pixels' })
  totalWidth!: number;
}

export class DateRangeDto {
  @ApiProperty({ description: 'Start date (ISO string)' })
  @IsDateString()
  start!: string;

  @ApiProperty({ description: 'End date (ISO string)' })
  @IsDateString()
  end!: string;
}

export class PerformanceMetricsDto {
  @ApiProperty({ description: 'Query execution time in milliseconds' })
  queryTime!: number;

  @ApiProperty({ description: 'Number of tickets loaded' })
  ticketCount!: number;

  @ApiProperty({ description: 'Whether data was cached' })
  cached!: boolean;

  @ApiProperty({ description: 'Cache hit/miss information' })
  cacheInfo?: {
    hit: boolean;
    key: string;
    ttl?: number;
  };
}
