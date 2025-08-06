#!/usr/bin/env -S deno run --allow-env --allow-net --allow-read

import pkg from '@prisma/client';
const { PrismaClient } = pkg;

interface CustomFieldDefinition {
  name: string;
  type: 'text' | 'number' | 'checkbox' | 'date' | 'dropdown' | 'textarea';
  label: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: string[];
}

// Default custom fields for common ticket types
const defaultCustomFields: Record<string, CustomFieldDefinition[]> = {
  'Workout': [
    {
      name: 'exercise_type',
      type: 'dropdown',
      label: 'Exercise Type',
      required: false,
      defaultValue: 'Cardio',
      options: ['Cardio', 'Strength Training', 'Yoga', 'Sports', 'Flexibility', 'Other']
    },
    {
      name: 'intensity_level',
      type: 'dropdown',
      label: 'Intensity Level',
      required: false,
      defaultValue: 'Medium',
      options: ['Low', 'Medium', 'High', 'Very High']
    },
    {
      name: 'target_calories',
      type: 'number',
      label: 'Target Calories',
      required: false,
      defaultValue: 300
    },
    {
      name: 'equipment_needed',
      type: 'checkbox',
      label: 'Equipment Needed',
      required: false,
      defaultValue: false
    },
    {
      name: 'workout_notes',
      type: 'textarea',
      label: 'Workout Notes',
      required: false,
      defaultValue: ''
    }
  ],
  'Work Meeting': [
    {
      name: 'meeting_type',
      type: 'dropdown',
      label: 'Meeting Type',
      required: false,
      defaultValue: 'Team Meeting',
      options: ['Team Meeting', 'Client Meeting', 'One-on-One', 'Planning Session', 'Review Meeting']
    },
    {
      name: 'attendees_count',
      type: 'number',
      label: 'Number of Attendees',
      required: false,
      defaultValue: 1
    },
    {
      name: 'has_agenda',
      type: 'checkbox',
      label: 'Has Agenda',
      required: false,
      defaultValue: false
    }
  ],
  'Personal Task': [
    {
      name: 'priority_level',
      type: 'dropdown',
      label: 'Priority Level',
      required: false,
      defaultValue: 'Medium',
      options: ['Low', 'Medium', 'High', 'Urgent']
    },
    {
      name: 'estimated_hours',
      type: 'number',
      label: 'Estimated Hours',
      required: false,
      defaultValue: 1
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Additional Notes',
      required: false,
      defaultValue: ''
    }
  ]
};

async function addDefaultCustomFields() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Starting migration: Adding default custom fields to existing ticket types...');
    
    // Get all ticket types that don't have custom fields yet (empty object)
    const ticketTypes = await prisma.ticketType.findMany();
    
    console.log(`📊 Found ${ticketTypes.length} ticket types without custom fields`);
    
    let updatedCount = 0;
    
    for (const ticketType of ticketTypes) {
      // Check if ticket type has empty properties schema
      const hasEmptySchema = !ticketType.propertiesSchema || 
        (typeof ticketType.propertiesSchema === 'object' && 
         ((Array.isArray(ticketType.propertiesSchema) && ticketType.propertiesSchema.length === 0) ||
          (!Array.isArray(ticketType.propertiesSchema) && Object.keys(ticketType.propertiesSchema).length === 0)));
      
      if (!hasEmptySchema) {
        console.log(`⏭️  Skipping "${ticketType.name}" - already has custom fields`);
        continue;
      }
      
      const customFields = defaultCustomFields[ticketType.name];
      
      if (customFields) {
        console.log(`⚙️  Adding custom fields to "${ticketType.name}"...`);
        
        // Update the ticket type with custom fields
        await prisma.ticketType.update({
          where: { id: ticketType.id },
          data: {
            propertiesSchema: JSON.parse(JSON.stringify(customFields))
          }
        });
        
        // Update existing tickets of this type with default values
        const tickets = await prisma.ticket.findMany({
          where: { typeId: ticketType.id }
        });
        
        if (tickets.length > 0) {
          console.log(`📝 Updating ${tickets.length} existing tickets with default values...`);
          
          const defaultValues: Record<string, unknown> = {};
          for (const field of customFields) {
            defaultValues[field.name] = field.defaultValue;
          }
          
          // Update all tickets with default custom property values
          for (const ticket of tickets) {
            const existingCustomProperties = (ticket.customProperties as Record<string, unknown>) || {};
            const mergedProperties = { ...defaultValues, ...existingCustomProperties };
            
            await prisma.ticket.update({
              where: { id: ticket.id },
              data: {
                customProperties: JSON.parse(JSON.stringify(mergedProperties))
              }
            });
          }
        }
        
        updatedCount++;
      } else {
        console.log(`ℹ️  No default custom fields defined for "${ticketType.name}"`);
      }
    }
    
    console.log(`✅ Migration completed successfully! Updated ${updatedCount} ticket types`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.main) {
  await addDefaultCustomFields();
}
