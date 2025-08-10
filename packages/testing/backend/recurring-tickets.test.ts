import { describe, it, beforeAll, afterAll, beforeEach } from 'jsr:@std/testing/bdd';
import { assertEquals, assertExists } from 'jsr:@std/assert';

// Import PrismaClient from the backend package node modules
const { PrismaClient } = await import('../../backend/../../node_modules/.deno/@prisma+client@6.13.0/node_modules/@prisma/client/index.js');

const prisma = new PrismaClient();

describe('Recurring Tickets', () => {
  let userId: string;
  let testTicketId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'test-recurrence@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User'
      }
    });
    userId = user.id;

    // Create a test ticket type
    const ticketType = await prisma.ticketType.create({
      data: {
        name: 'Test Recurring Type',
        description: 'Test type for recurrence',
        userId,
        defaultDuration: 60
      }
    });

    // Create a test ticket
    const ticket = await prisma.ticket.create({
      data: {
        userId,
        title: 'Test Recurring Ticket',
        description: 'A test ticket for recurrence testing',
        startTime: new Date('2025-08-10T09:00:00Z'),
        endTime: new Date('2025-08-10T10:00:00Z'),
        typeId: ticketType.id,
        status: 'FUTURE'
      }
    });
    testTicketId = ticket.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.recurrencePattern.deleteMany({
      where: { ticket: { userId } }
    });
    await prisma.ticket.deleteMany({
      where: { userId }
    });
    await prisma.ticketType.deleteMany({
      where: { userId }
    });
    await prisma.user.delete({
      where: { id: userId }
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up any recurrence patterns from previous tests
    await prisma.recurrencePattern.deleteMany({
      where: { ticket: { userId } }
    });
    await prisma.ticket.updateMany({
      where: { userId, id: { not: testTicketId } },
      data: {
        isRecurring: false,
        recurrenceId: null,
        parentTicketId: null,
        recurrenceEnd: null,
        maxOccurrences: null
      }
    });
    // Delete child instances
    await prisma.ticket.deleteMany({
      where: {
        userId,
        parentTicketId: { not: null }
      }
    });
  });

  it('should create a daily recurrence pattern', async () => {
    // Create recurrence pattern
    const recurrencePattern = await prisma.recurrencePattern.create({
      data: {
        ticketId: testTicketId,
        frequency: 'DAILY',
        interval: 1,
        skipDates: []
      }
    });

    // Update ticket to mark as recurring
    await prisma.ticket.update({
      where: { id: testTicketId },
      data: {
        isRecurring: true,
        recurrenceId: recurrencePattern.id
      }
    });

    const updatedTicket = await prisma.ticket.findUnique({
      where: { id: testTicketId },
      include: { recurrencePattern: true }
    });

    expect(updatedTicket?.isRecurring).toBe(true);
    expect(updatedTicket?.recurrencePattern?.frequency).toBe('DAILY');
    expect(updatedTicket?.recurrencePattern?.interval).toBe(1);
  });

  it('should create weekly recurrence pattern', async () => {
    const recurrencePattern = await prisma.recurrencePattern.create({
      data: {
        ticketId: testTicketId,
        frequency: 'WEEKLY',
        interval: 2,
        skipDates: []
      }
    });

    await prisma.ticket.update({
      where: { id: testTicketId },
      data: {
        isRecurring: true,
        recurrenceId: recurrencePattern.id,
        maxOccurrences: 5
      }
    });

    const pattern = await prisma.recurrencePattern.findUnique({
      where: { ticketId: testTicketId }
    });

    expect(pattern?.frequency).toBe('WEEKLY');
    expect(pattern?.interval).toBe(2);
  });

  it('should handle skip dates correctly', async () => {
    const skipDate = new Date('2025-08-17T09:00:00Z'); // Skip this occurrence
    
    const recurrencePattern = await prisma.recurrencePattern.create({
      data: {
        ticketId: testTicketId,
        frequency: 'WEEKLY',
        interval: 1,
        skipDates: [skipDate]
      }
    });

    expect(recurrencePattern.skipDates).toHaveLength(1);
    expect(recurrencePattern.skipDates[0]?.toISOString()).toBe(skipDate.toISOString());
  });

  it('should support end date limits', async () => {
    const endDate = new Date('2025-09-10T09:00:00Z');
    
    await prisma.recurrencePattern.create({
      data: {
        ticketId: testTicketId,
        frequency: 'DAILY',
        interval: 1,
        skipDates: []
      }
    });

    await prisma.ticket.update({
      where: { id: testTicketId },
      data: {
        isRecurring: true,
        recurrenceEnd: endDate
      }
    });

    const ticket = await prisma.ticket.findUnique({
      where: { id: testTicketId }
    });

    expect(ticket?.recurrenceEnd?.toISOString()).toBe(endDate.toISOString());
  });

  it('should support occurrence limits', async () => {
    await prisma.recurrencePattern.create({
      data: {
        ticketId: testTicketId,
        frequency: 'DAILY',
        interval: 1,
        skipDates: []
      }
    });

    await prisma.ticket.update({
      where: { id: testTicketId },
      data: {
        isRecurring: true,
        maxOccurrences: 10
      }
    });

    const ticket = await prisma.ticket.findUnique({
      where: { id: testTicketId }
    });

    expect(ticket?.maxOccurrences).toBe(10);
  });

  it('should create child ticket instances', async () => {
    // Create 3 child instances
    const childTickets = [];
    for (let i = 1; i <= 3; i++) {
      const startTime = new Date(`2025-08-${10 + i}T09:00:00Z`);
      const endTime = new Date(`2025-08-${10 + i}T10:00:00Z`);
      
      const childTicket = await prisma.ticket.create({
        data: {
          userId,
          title: 'Test Recurring Ticket',
          description: 'Child instance',
          startTime,
          endTime,
          typeId: (await prisma.ticket.findUnique({ where: { id: testTicketId } }))!.typeId,
          parentTicketId: testTicketId,
          status: 'FUTURE'
        }
      });
      childTickets.push(childTicket);
    }

    const parentWithChildren = await prisma.ticket.findUnique({
      where: { id: testTicketId },
      include: { childInstances: true }
    });

    expect(parentWithChildren?.childInstances).toHaveLength(3);
    
    // Verify child ticket relationships
    for (const child of childTickets) {
      const childWithParent = await prisma.ticket.findUnique({
        where: { id: child.id },
        include: { parentTicket: true }
      });
      expect(childWithParent?.parentTicket?.id).toBe(testTicketId);
    }
  });

  it('should allow detaching instances from series', async () => {
    // Create a child instance
    const childTicket = await prisma.ticket.create({
      data: {
        userId,
        title: 'Test Recurring Ticket',
        description: 'Child instance to detach',
        startTime: new Date('2025-08-11T09:00:00Z'),
        endTime: new Date('2025-08-11T10:00:00Z'),
        typeId: (await prisma.ticket.findUnique({ where: { id: testTicketId } }))!.typeId,
        parentTicketId: testTicketId,
        status: 'FUTURE'
      }
    });

    // Detach the instance
    await prisma.ticket.update({
      where: { id: childTicket.id },
      data: {
        parentTicketId: null,
        recurrenceId: null,
        isRecurring: false
      }
    });

    const detachedTicket = await prisma.ticket.findUnique({
      where: { id: childTicket.id },
      include: { parentTicket: true }
    });

    expect(detachedTicket?.parentTicket).toBeNull();
    expect(detachedTicket?.parentTicketId).toBeNull();
    expect(detachedTicket?.isRecurring).toBe(false);
  });
});
