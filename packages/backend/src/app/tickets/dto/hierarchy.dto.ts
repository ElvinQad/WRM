import { IsString, IsOptional, IsArray, IsBoolean, IsInt, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChildTicketDto {
  @ApiProperty({ description: 'Title of the child ticket' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Description of the child ticket' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Array of custom property keys to inherit from parent', 
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inheritCustomProperties?: string[];

  @ApiPropertyOptional({ description: 'Start time for the child ticket' })
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time for the child ticket' })
  @IsOptional()
  endTime?: string;
}

export class HierarchyProgressDto {
  @ApiProperty({ description: 'Number of completed child tickets' })
  completed!: number;

  @ApiProperty({ description: 'Total number of child tickets' })
  total!: number;

  @ApiProperty({ description: 'Completion percentage' })
  percentage!: number;
}

export class TicketWithHierarchyDto {
  @ApiProperty({ description: 'Ticket ID' })
  id!: string;

  @ApiProperty({ description: 'Ticket title' })
  title!: string;

  @ApiPropertyOptional({ description: 'Ticket description' })
  description?: string;

  @ApiProperty({ description: 'Ticket status' })
  status!: string;

  @ApiProperty({ description: 'Start time' })
  startTime!: Date;

  @ApiProperty({ description: 'End time' })
  endTime!: Date;

  @ApiPropertyOptional({ description: 'Parent ticket ID' })
  hierarchyParentId?: string;

  @ApiProperty({ description: 'Nesting level in hierarchy' })
  nestingLevel!: number;

  @ApiPropertyOptional({ description: 'Child order' })
  childOrder?: number;

  @ApiProperty({ description: 'Auto-complete when children are done' })
  autoCompleteOnChildrenDone!: boolean;

  @ApiProperty({ description: 'Number of completed children' })
  childCompletionCount!: number;

  @ApiProperty({ description: 'Total number of children' })
  totalChildCount!: number;

  @ApiPropertyOptional({ description: 'Custom properties' })
  customProperties?: any;

  @ApiPropertyOptional({ description: 'Child tickets', type: [TicketWithHierarchyDto] })
  childTickets?: TicketWithHierarchyDto[];
}

export class HierarchyResponseDto {
  @ApiProperty({ description: 'The main ticket with hierarchy info' })
  ticket!: TicketWithHierarchyDto;

  @ApiProperty({ description: 'Direct children of the ticket' })
  children!: TicketWithHierarchyDto[];

  @ApiProperty({ description: 'Completion progress information' })
  completionProgress!: HierarchyProgressDto;

  @ApiProperty({ description: 'Maximum depth in this hierarchy branch' })
  maxDepth!: number;
}

export class CompletionSettingsDto {
  @ApiProperty({ description: 'Whether to auto-complete parent when all children are done' })
  @IsBoolean()
  autoCompleteOnChildrenDone!: boolean;
}

export class MoveHierarchyDto {
  @ApiPropertyOptional({ description: 'New parent ticket ID (null for root level)' })
  @IsUUID()
  @IsOptional()
  newParentId?: string;

  @ApiPropertyOptional({ description: 'Whether to validate nesting levels', default: true })
  @IsBoolean()
  @IsOptional()
  validateNesting?: boolean = true;
}

export class CompletionProgressResponseDto {
  @ApiProperty({ description: 'Number of completed children' })
  completedChildren!: number;

  @ApiProperty({ description: 'Total number of children' })
  totalChildren!: number;

  @ApiProperty({ description: 'Completion percentage' })
  percentage!: number;

  @ApiProperty({ description: 'Whether parent can auto-complete' })
  canAutoComplete!: boolean;
}

export class BulkHierarchyOperationDto {
  @ApiProperty({ description: 'Array of ticket IDs to operate on' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  ticketIds!: string[];

  @ApiProperty({ description: 'Operation type' })
  @IsString()
  operation!: 'move' | 'delete' | 'complete';

  @ApiPropertyOptional({ description: 'Target parent ID for move operations' })
  @IsUUID()
  @IsOptional()
  targetParentId?: string;
}
