import { IsDateString, IsEnum, IsInt, IsOptional, IsArray, IsUUID, Min, Max } from 'class-validator';

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM'
}

export class CreateRecurrenceDto {
  @IsEnum(RecurrenceFrequency)
  frequency!: RecurrenceFrequency;

  @IsInt()
  @Min(1)
  @Max(365)
  interval!: number;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999)
  maxOccurrences?: number;

  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  skipDates?: string[];
}

export class UpdateRecurrenceDto {
  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  frequency?: RecurrenceFrequency;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  interval?: number;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9999)
  maxOccurrences?: number;

  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  skipDates?: string[];
}

export class RecurrenceResponseDto {
  id!: string;
  frequency!: RecurrenceFrequency;
  interval!: number;
  endDate?: Date;
  maxOccurrences?: number;
  skipDates?: Date[];
  createdAt!: Date;
}

export class DetachInstanceDto {
  @IsUUID()
  ticketId!: string;
}
