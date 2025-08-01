import { FrontendTicket } from '@wrm/types';

// Sample ticket data generator for testing purposes
export const generateSampleTickets = (): FrontendTicket[] => {
  const now = new Date();
  const tickets: FrontendTicket[] = [];
  
  const colors = ['#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#fed7d7'];
  const categories = ['Work', 'Meeting', 'Personal', 'Development', 'Review'];
  const titles = [
    'Team Standup',
    'Code Review',
    'Client Meeting',
    'Development Work',
    'Documentation',
    'Testing',
    'Planning Session',
    'Design Review',
    'Bug Fixes',
    'Feature Implementation',
    'Sprint Planning',
    'Daily Scrum',
    'Architecture Review',
    'User Testing',
    'Deployment',
  ];
  
  // Generate tickets with some overlapping to test stacking
  for (let i = 0; i < 15; i++) {
    const startOffset = (Math.random() - 0.5) * 24 * 60 * 60 * 1000; // ±12 hours
    const duration = Math.random() * 3 * 60 * 60 * 1000 + 30 * 60 * 1000; // 30min to 3.5 hours
    
    const start = new Date(now.getTime() + startOffset);
    const end = new Date(start.getTime() + duration);
    
    tickets.push({
      id: `ticket-${i}`,
      userId: 'sample-user',
      title: titles[i % titles.length],
      start,
      end,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      typeId: 'sample-type-id',
      customProperties: {
        description: `This is a detailed description for ${titles[i % titles.length]} - Task ${i + 1}`,
      },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      color: colors[Math.floor(Math.random() * colors.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
    });
  }
  
  // Add some specifically overlapping tickets to test stacking
  const baseTime = now.getTime();
  
  // Overlapping group 1 - Morning meetings
  tickets.push({
    id: 'overlap-1',
    userId: 'sample-user',
    title: 'Morning Standup',
    start: new Date(baseTime + 2 * 60 * 60 * 1000), // +2 hours
    end: new Date(baseTime + 2.5 * 60 * 60 * 1000), // +2.5 hours
    startTime: new Date(baseTime + 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(baseTime + 2.5 * 60 * 60 * 1000).toISOString(),
    typeId: 'sample-type-id',
    customProperties: {
      description: 'Daily team standup meeting',
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    color: '#dbeafe',
    category: 'Meeting',
  });
  
  tickets.push({
    id: 'overlap-2',
    userId: 'sample-user',
    title: 'Architecture Discussion',
    start: new Date(baseTime + 2.25 * 60 * 60 * 1000), // +2.25 hours (overlaps with standup)
    end: new Date(baseTime + 3.5 * 60 * 60 * 1000), // +3.5 hours
    startTime: new Date(baseTime + 2.25 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(baseTime + 3.5 * 60 * 60 * 1000).toISOString(),
    typeId: 'sample-type-id',
    customProperties: {
      description: 'Discuss system architecture',
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    color: '#dcfce7',
    category: 'Meeting',
  });
  
  tickets.push({
    id: 'overlap-3',
    userId: 'sample-user',
    title: 'Code Review Session',
    start: new Date(baseTime + 3 * 60 * 60 * 1000), // +3 hours (overlaps with architecture)
    end: new Date(baseTime + 4 * 60 * 60 * 1000), // +4 hours
    startTime: new Date(baseTime + 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(baseTime + 4 * 60 * 60 * 1000).toISOString(),
    typeId: 'sample-type-id',
    customProperties: {
      description: 'Review pending pull requests',
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    color: '#fef3c7',
    category: 'Development',
  });
  
  // Overlapping group 2 - Afternoon work
  tickets.push({
    id: 'overlap-4',
    userId: 'sample-user',
    title: 'Feature Development',
    start: new Date(baseTime + 6 * 60 * 60 * 1000), // +6 hours
    end: new Date(baseTime + 9 * 60 * 60 * 1000), // +9 hours
    startTime: new Date(baseTime + 6 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(baseTime + 9 * 60 * 60 * 1000).toISOString(),
    typeId: 'sample-type-id',
    customProperties: {
      description: 'Implement new timeline features',
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    color: '#f3e8ff',
    category: 'Development',
  });
  
  tickets.push({
    id: 'overlap-5',
    userId: 'sample-user',
    title: 'Bug Fixing',
    start: new Date(baseTime + 7 * 60 * 60 * 1000), // +7 hours (overlaps with feature dev)
    end: new Date(baseTime + 8 * 60 * 60 * 1000), // +8 hours
    startTime: new Date(baseTime + 7 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(baseTime + 8 * 60 * 60 * 1000).toISOString(),
    typeId: 'sample-type-id',
    customProperties: {
      description: 'Fix critical bugs in timeline',
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    color: '#fed7d7',
    category: 'Development',
  });
  
  return tickets;
};



// Generate tickets based on visible time range
export const generateTicketsForTimeRange = (startTime: number, endTime: number): FrontendTicket[] => {
  const sampleTickets = generateSampleTickets();
  
  // Filter sample tickets to only include those that overlap with the visible range
  const filteredSampleTickets = sampleTickets.filter(ticket => {
    const ticketStart = ticket.start.getTime();
    const ticketEnd = ticket.end.getTime();
    return (ticketStart < endTime && ticketEnd > startTime);
  });
  
  return [...filteredSampleTickets];
};
