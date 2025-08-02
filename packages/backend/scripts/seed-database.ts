// Database seed script for WRM Timeline application
import { PrismaClient } from '@prisma/client';
import { hash } from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in development)
  await prisma.agentCollaboration.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const hashedPassword = await hash('password123');
  
  const user1 = await prisma.user.create({
    data: {
      email: 'demo@wrm.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'timeline@wrm.com',
      password: hashedPassword,
      firstName: 'Timeline',
      lastName: 'Tester',
    },
  });

  console.log('✅ Created users:', user1.email, user2.email);

  // Create default ticket types
  const workTicketType = await prisma.ticketType.create({
    data: {
      name: 'Work Task',
      description: 'General work and professional tasks',
      propertiesSchema: {
        priority: { type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'] },
        project: { type: 'text', required: true },
        estimatedHours: { type: 'number', min: 0.5, max: 8 }
      },
      defaultDuration: 120, // 2 hours
      color: '#3B82F6', // Blue
      userId: user1.id,
    },
  });

  const meetingTicketType = await prisma.ticketType.create({
    data: {
      name: 'Meeting',
      description: 'Meetings, calls, and collaborative sessions',
      propertiesSchema: {
        meetingType: { type: 'select', options: ['Standup', 'Planning', 'Review', 'One-on-One'] },
        attendees: { type: 'text' },
        location: { type: 'text' }
      },
      defaultDuration: 60, // 1 hour
      color: '#10B981', // Green
      userId: user1.id,
    },
  });

  const personalTicketType = await prisma.ticketType.create({
    data: {
      name: 'Personal',
      description: 'Personal tasks and activities',
      propertiesSchema: {
        category: { type: 'select', options: ['Health', 'Learning', 'Hobby', 'Family'] },
        importance: { type: 'select', options: ['Nice to have', 'Important', 'Critical'] }
      },
      defaultDuration: 90, // 1.5 hours
      color: '#8B5CF6', // Purple
      userId: user1.id,
    },
  });

  console.log('✅ Created ticket types:', [workTicketType.name, meetingTicketType.name, personalTicketType.name]);

  // Create sample tickets for timeline demonstration
  const baseDate = new Date('2025-08-01T09:00:00Z');
  
  // Today's tickets (various states for demonstration)
  const todayTickets = [
    {
      title: 'Morning Standup',
      description: 'Daily team synchronization meeting',
      startTime: new Date(baseDate.getTime()), // 9:00 AM
      endTime: new Date(baseDate.getTime() + 30 * 60 * 1000), // 9:30 AM
      typeId: meetingTicketType.id,
      userId: user1.id,
      status: 'PAST_CONFIRMED',
      customProperties: {
        meetingType: 'Standup',
        attendees: 'Development Team',
        location: 'Conference Room A'
      },
      lastInteraction: new Date(baseDate.getTime() + 25 * 60 * 1000),
    },
    {
      title: 'Timeline Feature Development',
      description: 'Implement drag-and-drop timeline functionality',
      startTime: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000), // 10:00 AM
      endTime: new Date(baseDate.getTime() + 3 * 60 * 60 * 1000), // 12:00 PM
      typeId: workTicketType.id,
      userId: user1.id,
      status: 'ACTIVE',
      customProperties: {
        priority: 'High',
        project: 'WRM Timeline',
        estimatedHours: 2
      },
    },
    {
      title: 'Lunch Break',
      description: 'Personal time for lunch',
      startTime: new Date(baseDate.getTime() + 3 * 60 * 60 * 1000), // 12:00 PM
      endTime: new Date(baseDate.getTime() + 4 * 60 * 60 * 1000), // 1:00 PM
      typeId: personalTicketType.id,
      userId: user1.id,
      status: 'FUTURE',
      customProperties: {
        category: 'Health',
        importance: 'Important'
      },
    },
    {
      title: 'Client Review Meeting',
      description: 'Present timeline prototype to client',
      startTime: new Date(baseDate.getTime() + 5 * 60 * 60 * 1000), // 2:00 PM
      endTime: new Date(baseDate.getTime() + 6 * 60 * 60 * 1000), // 3:00 PM
      typeId: meetingTicketType.id,
      userId: user1.id,
      status: 'FUTURE',
      customProperties: {
        meetingType: 'Review',
        attendees: 'Client, PM, Dev Lead',
        location: 'Video Call'
      },
    },
    {
      title: 'Code Review',
      description: 'Review pull requests from team',
      startTime: new Date(baseDate.getTime() + 6.5 * 60 * 60 * 1000), // 3:30 PM
      endTime: new Date(baseDate.getTime() + 7.5 * 60 * 60 * 1000), // 4:30 PM
      typeId: workTicketType.id,
      userId: user1.id,
      status: 'FUTURE',
      customProperties: {
        priority: 'Medium',
        project: 'WRM Timeline',
        estimatedHours: 1
      },
    },
  ] as const;

  // Tomorrow's tickets
  const tomorrowBase = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowTickets = [
    {
      title: 'Sprint Planning',
      description: 'Plan next sprint objectives and stories',
      startTime: new Date(tomorrowBase.getTime()), // 9:00 AM tomorrow
      endTime: new Date(tomorrowBase.getTime() + 2 * 60 * 60 * 1000), // 11:00 AM tomorrow
      typeId: meetingTicketType.id,
      userId: user1.id,
      status: 'FUTURE',
      customProperties: {
        meetingType: 'Planning',
        attendees: 'Scrum Team',
        location: 'Main Conference Room'
      },
    },
    {
      title: 'API Integration Testing',
      description: 'Test timeline API endpoints with frontend',
      startTime: new Date(tomorrowBase.getTime() + 2.5 * 60 * 60 * 1000), // 11:30 AM tomorrow
      endTime: new Date(tomorrowBase.getTime() + 5 * 60 * 60 * 1000), // 2:00 PM tomorrow
      typeId: workTicketType.id,
      userId: user1.id,
      status: 'FUTURE',
      customProperties: {
        priority: 'High',
        project: 'WRM Timeline',
        estimatedHours: 2.5
      },
    },
  ] as const;

  // Past week tickets (for historical data demonstration)
  const pastWeekBase = new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const pastTickets = [
    {
      title: 'Database Schema Design',
      description: 'Design Prisma schema for timeline features',
      startTime: new Date(pastWeekBase.getTime()), 
      endTime: new Date(pastWeekBase.getTime() + 4 * 60 * 60 * 1000),
      typeId: workTicketType.id,
      userId: user1.id,
      status: 'PAST_CONFIRMED',
      customProperties: {
        priority: 'High',
        project: 'WRM Timeline',
        estimatedHours: 4
      },
      lastInteraction: new Date(pastWeekBase.getTime() + 3.5 * 60 * 60 * 1000),
    },
    {
      title: 'Requirements Gathering',
      description: 'Gather requirements for timeline functionality',
      startTime: new Date(pastWeekBase.getTime() + 24 * 60 * 60 * 1000),
      endTime: new Date(pastWeekBase.getTime() + 26 * 60 * 60 * 1000),
      typeId: meetingTicketType.id,
      userId: user1.id,
      status: 'PAST_UNTOUCHED', // No interaction recorded
      customProperties: {
        meetingType: 'Planning',
        attendees: 'Product Team',
        location: 'Office'
      },
    },
  ] as const;

  // Create all tickets
  const allTickets = [...todayTickets, ...tomorrowTickets, ...pastTickets];
  
  for (const ticketData of allTickets) {
    await prisma.ticket.create({
      data: ticketData,
    });
  }

  console.log(`✅ Created ${allTickets.length} sample tickets across different time periods`);

  // Create sample agents for AI functionality
  const codeReviewAgent = await prisma.agent.create({
    data: {
      name: 'Code Review Assistant',
      description: 'AI agent specialized in code review and development best practices',
      systemPrompt: 'You are a helpful AI assistant specialized in code review. You help developers identify potential issues, suggest improvements, and ensure code quality standards.',
    },
  });

  const schedulingAgent = await prisma.agent.create({
    data: {
      name: 'Smart Scheduler',
      description: 'AI agent that helps optimize schedule and suggests timeline improvements',
      systemPrompt: 'You are a scheduling assistant that helps users optimize their timeline, identify scheduling conflicts, and suggest better time management strategies.',
    },
  });

  console.log('✅ Created AI agents:', [codeReviewAgent.name, schedulingAgent.name]);

  // Create some agent collaborations (sample AI interactions)
  await prisma.agentCollaboration.create({
    data: {
      ticketId: (await prisma.ticket.findFirst({ where: { title: 'Code Review' } }))!.id,
      agentId: codeReviewAgent.id,
      userId: user1.id,
      status: 'active',
      results: {
        suggestions: ['Consider extracting common logic into utility functions', 'Add unit tests for edge cases'],
        confidence: 0.85
      },
    },
  });

  console.log('✅ Created sample agent collaborations');

  // Print summary
  const userCount = await prisma.user.count();
  const ticketTypeCount = await prisma.ticketType.count();
  const ticketCount = await prisma.ticket.count();
  const agentCount = await prisma.agent.count();

  console.log('\n🎉 Database seeded successfully!');
  console.log(`📊 Summary:`);
  console.log(`   Users: ${userCount}`);
  console.log(`   Ticket Types: ${ticketTypeCount}`);
  console.log(`   Tickets: ${ticketCount}`);
  console.log(`   AI Agents: ${agentCount}`);
  console.log('\n💡 Demo credentials:');
  console.log(`   Email: demo@wrm.com`);
  console.log(`   Password: password123`);
  console.log('\n🚀 Your timeline database is ready for testing!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
