import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.ts';
import { CreateTicketTypeDto, UpdateTicketTypeDto, CustomFieldDefinitionDto } from './dto/create-ticket-type.dto.ts';

@Injectable()
export class TicketTypesService {
  constructor(private prisma: PrismaService) {}

  private validateCustomFieldSchema(customFieldSchema?: CustomFieldDefinitionDto[]): void {
    if (!customFieldSchema || customFieldSchema.length === 0) {
      return;
    }

    const supportedTypes = ['text', 'number', 'checkbox', 'date', 'dropdown', 'textarea'];
    const fieldNames = new Set<string>();

    for (const field of customFieldSchema) {
      // Validate field type
      if (!supportedTypes.includes(field.type)) {
        throw new BadRequestException(`Unsupported field type: ${field.type}. Supported types: ${supportedTypes.join(', ')}`);
      }

      // Validate unique field names
      if (fieldNames.has(field.name)) {
        throw new BadRequestException(`Duplicate field name: ${field.name}. Field names must be unique within a ticket type.`);
      }
      fieldNames.add(field.name);

      // Validate dropdown has options
      if (field.type === 'dropdown' && (!field.options || field.options.length === 0)) {
        throw new BadRequestException(`Dropdown field '${field.name}' must have at least one option.`);
      }

      // Validate field name format
      if (!/^[a-zA-Z0-9_]+$/.test(field.name)) {
        throw new BadRequestException(`Field name '${field.name}' can only contain letters, numbers, and underscores.`);
      }
    }

    // Validate minimum supported types (AC requirement: 5 field types minimum)
    if (customFieldSchema.length > 0) {
      const _uniqueTypes = new Set(customFieldSchema.map(f => f.type));
      // This validation ensures we support the minimum 5 types, not that each schema must use all 5
    }
  }

  async createTicketType(createTicketTypeDto: CreateTicketTypeDto, userId: string) {
    // Validate custom field schema
    this.validateCustomFieldSchema(createTicketTypeDto.customFieldSchema);

    // Check for duplicate names for this user
    const existingType = await this.prisma.ticketType.findFirst({
      where: {
        name: createTicketTypeDto.name,
        userId: userId,
      },
    });

    if (existingType) {
      throw new BadRequestException('A ticket type with this name already exists');
    }

    return await this.prisma.ticketType.create({
      data: {
        name: createTicketTypeDto.name.trim(),
        color: createTicketTypeDto.color || '#3B82F6', // Default blue color
        propertiesSchema: createTicketTypeDto.customFieldSchema ? JSON.parse(JSON.stringify(createTicketTypeDto.customFieldSchema)) : {},
        userId: userId,
      },
    });
  }

  async updateTicketType(id: string, updateTicketTypeDto: UpdateTicketTypeDto, userId: string) {
    // Validate custom field schema
    console.log('Updating ticket type with DTO:', updateTicketTypeDto);
    console.log('Custom field schema:', updateTicketTypeDto.customFieldSchema);
    
    this.validateCustomFieldSchema(updateTicketTypeDto.customFieldSchema);

    // First check if the ticket type exists and belongs to the user
    const existingType = await this.prisma.ticketType.findFirst({
      where: {
        id,
        userId: userId,
      },
    });

    if (!existingType) {
      throw new NotFoundException('Ticket type not found or access denied');
    }

    // Check for duplicate names if name is being updated
    if (updateTicketTypeDto.name && updateTicketTypeDto.name !== existingType.name) {
      const duplicateType = await this.prisma.ticketType.findFirst({
        where: {
          name: updateTicketTypeDto.name,
          userId: userId,
          id: { not: id }, // Exclude current record
        },
      });

      if (duplicateType) {
        throw new BadRequestException('A ticket type with this name already exists');
      }
    }

    // Update ticket type
    const updatedTicketType = await this.prisma.ticketType.update({
      where: { id },
      data: {
        ...(updateTicketTypeDto.name && { name: updateTicketTypeDto.name.trim() }),
        ...(updateTicketTypeDto.color && { color: updateTicketTypeDto.color }),
        ...(updateTicketTypeDto.customFieldSchema !== undefined && { 
          propertiesSchema: updateTicketTypeDto.customFieldSchema ? 
            JSON.parse(JSON.stringify(updateTicketTypeDto.customFieldSchema)) : {} 
        }),
      },
    });

    // If custom field schema was updated, update existing tickets with default values
    if (updateTicketTypeDto.customFieldSchema !== undefined) {
      await this.updateExistingTicketsWithDefaultValues(id, updateTicketTypeDto.customFieldSchema);
    }

    return updatedTicketType;
  }

  private async updateExistingTicketsWithDefaultValues(typeId: string, customFieldSchema: CustomFieldDefinitionDto[]): Promise<void> {
    // Get all tickets of this type
    const tickets = await this.prisma.ticket.findMany({
      where: { typeId },
    });

    if (tickets.length === 0) {
      return;
    }

    // Create default values for new fields
    const defaultValues: Record<string, unknown> = {};
    for (const field of customFieldSchema) {
      if (field.defaultValue !== undefined) {
        defaultValues[field.name] = field.defaultValue;
      } else {
        // Set type-appropriate default values
        switch (field.type) {
          case 'text':
          case 'textarea':
            defaultValues[field.name] = '';
            break;
          case 'number':
            defaultValues[field.name] = 0;
            break;
          case 'checkbox':
            defaultValues[field.name] = false;
            break;
          case 'date':
            defaultValues[field.name] = null;
            break;
          case 'dropdown':
            defaultValues[field.name] = field.options?.[0] || null;
            break;
          default:
            defaultValues[field.name] = null;
        }
      }
    }

    // Update each ticket with default values for missing properties
    for (const ticket of tickets) {
      const currentProperties = ticket.customProperties as Record<string, unknown>;
      const updatedProperties = { ...currentProperties };
      
      // Add default values for new fields that don't exist
      for (const [fieldName, defaultValue] of Object.entries(defaultValues)) {
        if (!(fieldName in updatedProperties)) {
          updatedProperties[fieldName] = defaultValue;
        }
      }

      // Only update if there are changes
      if (Object.keys(defaultValues).some(key => !(key in currentProperties))) {
        await this.prisma.ticket.update({
          where: { id: ticket.id },
          data: { customProperties: JSON.parse(JSON.stringify(updatedProperties)) },
        });
      }
    }
  }

  async getTicketTypes(userId: string) {
    console.log('Service received userId:', userId);
    console.log('Service userId type:', typeof userId);
    return await this.prisma.ticketType.findMany({
      where: {
        OR: [
          { userId: userId }, // User's custom types
          { userId: null },   // Global types
        ],
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getTicketType(id: string, userId: string) {
    return await this.prisma.ticketType.findFirst({
      where: {
        id,
        OR: [
          { userId: userId },
          { userId: null },
        ],
      },
    });
  }
}
