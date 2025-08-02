import { IsString, Length, Matches, IsOptional, IsHexColor } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketTypeDto {
  @ApiProperty({
    description: 'Name of the ticket type',
    example: 'Work Meeting',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @Length(3, 50, {
    message: 'Name must be between 3 and 50 characters long',
  })
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name can only contain letters, numbers, and spaces',
  })
  name!: string;

  @ApiProperty({
    description: 'Color for the ticket type in hex format',
    example: '#3B82F6',
    required: false,
  })
  @IsOptional()
  @IsHexColor({
    message: 'Color must be a valid hex color',
  })
  color?: string;
}

export class UpdateTicketTypeDto {
  @ApiProperty({
    description: 'Name of the ticket type',
    example: 'Work Meeting',
    minLength: 3,
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 50, {
    message: 'Name must be between 3 and 50 characters long',
  })
  @Matches(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name can only contain letters, numbers, and spaces',
  })
  name?: string;

  @ApiProperty({
    description: 'Color for the ticket type in hex format',
    example: '#3B82F6',
    required: false,
  })
  @IsOptional()
  @IsHexColor({
    message: 'Color must be a valid hex color',
  })
  color?: string;
}
