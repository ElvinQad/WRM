import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTicketDto as BaseCreateTicketDto, UpdateTicketDto as BaseUpdateTicketDto, BaseTicket } from '@wrm/types';

export class CreateTicketDto implements BaseCreateTicketDto {
  @ApiProperty({ description: 'Ticket title' })
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Ticket start time', example: '2025-07-29T10:00:00Z' })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ description: 'Ticket end time', example: '2025-07-29T11:00:00Z' })
  @IsDateString()
  endTime!: string;

  @ApiProperty({ description: 'Ticket type ID' })
  @IsUUID()
  typeId!: string;

  @ApiPropertyOptional({ description: 'Custom properties as JSON' })
  @IsOptional()
  customProperties?: Record<string, unknown>;
}

export class UpdateTicketDto implements BaseUpdateTicketDto {
  @ApiPropertyOptional({ description: 'Ticket title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Ticket start time', example: '2025-07-29T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'Ticket end time', example: '2025-07-29T11:00:00Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Ticket type ID' })
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional({ description: 'Custom properties as JSON' })
  @IsOptional()
  customProperties?: Record<string, unknown>;
}

export class TicketResponseDto implements BaseTicket {
  @ApiProperty({ description: 'Ticket ID' })
  id!: string;

  @ApiProperty({ description: 'User ID' })
  userId!: string;

  @ApiProperty({ description: 'Ticket title' })
  title!: string;

  @ApiPropertyOptional({ description: 'Ticket description' })
  description?: string;

  @ApiProperty({ description: 'Ticket start time' })
  startTime!: string;

  @ApiProperty({ description: 'Ticket end time' })
  endTime!: string;

  @ApiProperty({ description: 'Ticket type ID' })
  typeId!: string;

  @ApiProperty({ description: 'Custom properties' })
  customProperties!: Record<string, unknown>;

  @ApiProperty({ description: 'Ticket status', enum: ['FUTURE', 'ACTIVE', 'PAST_UNTOUCHED', 'PAST_CONFIRMED'] })
  status!: 'FUTURE' | 'ACTIVE' | 'PAST_UNTOUCHED' | 'PAST_CONFIRMED';

  @ApiPropertyOptional({ description: 'Last interaction timestamp' })
  lastInteraction?: string;

  @ApiProperty({ description: 'Whether ticket was AI generated' })
  aiGenerated!: boolean;

  @ApiPropertyOptional({ description: 'AI context information' })
  aiContext?: string;

  @ApiPropertyOptional({ description: 'Ticket priority' })
  priority?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: string;

  // Additional frontend-friendly properties
  @ApiPropertyOptional({ description: 'Ticket type name' })
  typeName?: string;

  @ApiPropertyOptional({ description: 'Ticket color (from custom properties)' })
  color?: string;

  @ApiPropertyOptional({ description: 'Ticket category (from custom properties)' })
  category?: string;
}
