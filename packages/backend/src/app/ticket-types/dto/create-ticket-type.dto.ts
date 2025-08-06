import { IsString, Length, Matches, IsOptional, IsHexColor, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CustomFieldDefinitionDto {
  @ApiProperty({
    description: 'Name of the custom field',
    example: 'project_id',
  })
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Field name can only contain letters, numbers, and underscores',
  })
  name!: string;

  @ApiProperty({
    description: 'Type of the custom field',
    enum: ['text', 'number', 'checkbox', 'date', 'dropdown', 'textarea'],
    example: 'text',
  })
  @IsString()
  type!: 'text' | 'number' | 'checkbox' | 'date' | 'dropdown' | 'textarea';

  @ApiProperty({
    description: 'Label for the custom field',
    example: 'Project ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({
    description: 'Whether the field is required',
    example: false,
    required: false,
  })
  @IsOptional()
  required?: boolean;

  @ApiProperty({
    description: 'Default value for the field',
    required: false,
  })
  @IsOptional()
  defaultValue?: unknown;

  @ApiProperty({
    description: 'Options for dropdown type',
    example: ['Option 1', 'Option 2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];
}

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

  @ApiProperty({
    description: 'Custom field schema for the ticket type',
    type: [CustomFieldDefinitionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDefinitionDto)
  customFieldSchema?: CustomFieldDefinitionDto[];
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

  @ApiProperty({
    description: 'Custom field schema for the ticket type',
    type: [CustomFieldDefinitionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDefinitionDto)
  customFieldSchema?: CustomFieldDefinitionDto[];
}
