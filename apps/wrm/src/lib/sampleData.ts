import { Ticket } from '../components/timeline/Timeline';

// Sample ticket data generator for testing purposes
export const generateSampleTickets = (): Ticket[] => {
  const now = new Date();
  const tickets: Ticket[] = [];
  
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
      title: titles[i % titles.length],
      description: `This is a detailed description for ${titles[i % titles.length]} - Task ${i + 1}`,
      start,
      end,
      color: colors[Math.floor(Math.random() * colors.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
    });
  }
  
  // Add some specifically overlapping tickets to test stacking
  const baseTime = now.getTime();
  
  // Overlapping group 1 - Morning meetings
  tickets.push({
    id: 'overlap-1',
    title: 'Morning Standup',
    description: 'Daily team standup meeting',
    start: new Date(baseTime + 2 * 60 * 60 * 1000), // +2 hours
    end: new Date(baseTime + 2.5 * 60 * 60 * 1000), // +2.5 hours
    color: '#dbeafe',
    category: 'Meeting',
  });
  
  tickets.push({
    id: 'overlap-2',
    title: 'Architecture Discussion',
    description: 'Discuss system architecture',
    start: new Date(baseTime + 2.25 * 60 * 60 * 1000), // +2.25 hours (overlaps with standup)
    end: new Date(baseTime + 3.5 * 60 * 60 * 1000), // +3.5 hours
    color: '#dcfce7',
    category: 'Meeting',
  });
  
  tickets.push({
    id: 'overlap-3',
    title: 'Code Review Session',
    description: 'Review pending pull requests',
    start: new Date(baseTime + 3 * 60 * 60 * 1000), // +3 hours (overlaps with architecture)
    end: new Date(baseTime + 4 * 60 * 60 * 1000), // +4 hours
    color: '#fef3c7',
    category: 'Development',
  });
  
  // Overlapping group 2 - Afternoon work
  tickets.push({
    id: 'overlap-4',
    title: 'Feature Development',
    description: 'Implement new timeline features',
    start: new Date(baseTime + 6 * 60 * 60 * 1000), // +6 hours
    end: new Date(baseTime + 9 * 60 * 60 * 1000), // +9 hours
    color: '#f3e8ff',
    category: 'Development',
  });
  
  tickets.push({
    id: 'overlap-5',
    title: 'Bug Fixing',
    description: 'Fix critical bugs in timeline',
    start: new Date(baseTime + 7 * 60 * 60 * 1000), // +7 hours (overlaps with feature dev)
    end: new Date(baseTime + 8 * 60 * 60 * 1000), // +8 hours
    color: '#fed7d7',
    category: 'Development',
  });
  
  return tickets;
};

// Generate infinite tickets that span across different time periods
export const generateInfiniteTickets = (startTime: number, endTime: number): Ticket[] => {
  const tickets: Ticket[] = [];
  const colors = ['#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#fed7d7'];
  const categories = ['Work', 'Meeting', 'Personal', 'Development', 'Review', 'Planning', 'Testing'];
  
  // Different ticket types for different time scales
  const ticketTypes = {
    hours: [
      { title: 'Quick Standup', duration: [15, 30], frequency: 0.3 },
      { title: 'Focus Work', duration: [60, 180], frequency: 0.4 },
      { title: 'Meeting', duration: [30, 90], frequency: 0.2 },
      { title: 'Break', duration: [15, 30], frequency: 0.1 },
    ],
    days: [
      { title: 'Project Work', duration: [2 * 60, 8 * 60], frequency: 0.4 },
      { title: 'Team Meeting', duration: [60, 120], frequency: 0.2 },
      { title: 'Client Call', duration: [30, 90], frequency: 0.15 },
      { title: 'Planning Session', duration: [90, 180], frequency: 0.15 },
      { title: 'Review & Testing', duration: [120, 240], frequency: 0.1 },
    ],
    weeks: [
      { title: 'Sprint Work', duration: [1 * 24 * 60, 3 * 24 * 60], frequency: 0.3 },
      { title: 'Weekly Planning', duration: [2 * 60, 4 * 60], frequency: 0.2 },
      { title: 'Project Milestone', duration: [4 * 60, 8 * 60], frequency: 0.2 },
      { title: 'Training', duration: [8 * 60, 16 * 60], frequency: 0.15 },
      { title: 'Conference', duration: [8 * 60, 24 * 60], frequency: 0.15 },
    ],
  };
  
  // Determine the time scale based on the duration
  const duration = endTime - startTime;
  let scale: keyof typeof ticketTypes;
  
  if (duration <= 2 * 24 * 60 * 60 * 1000) { // <= 2 days
    scale = 'hours';
  } else if (duration <= 30 * 24 * 60 * 60 * 1000) { // <= 30 days
    scale = 'days';
  } else {
    scale = 'weeks'; // Default to weeks for longer durations
  }
  
  const availableTicketTypes = ticketTypes[scale];
  const totalDurationMinutes = duration / (60 * 1000);
  
  // Calculate how many tickets to generate based on time scale
  let ticketCount: number;
  switch (scale) {
    case 'hours':
      ticketCount = Math.floor(totalDurationMinutes / 120); // One ticket every 2 hours on average
      break;
    case 'days':
      ticketCount = Math.floor(totalDurationMinutes / (8 * 60)); // One ticket every 8 hours on average
      break;
    case 'weeks':
    default:
      ticketCount = Math.floor(totalDurationMinutes / (24 * 60)); // One ticket every day on average
      break;
  }
  
  // Generate tickets
  for (let i = 0; i < ticketCount; i++) {
    // Pick a random ticket type based on frequency
    const random = Math.random();
    let cumulativeFreq = 0;
    let selectedType = availableTicketTypes[0];
    
    for (const type of availableTicketTypes) {
      cumulativeFreq += type.frequency;
      if (random <= cumulativeFreq) {
        selectedType = type;
        break;
      }
    }
    
    // Random start time within the range
    const ticketStartTime = startTime + Math.random() * (duration * 0.8); // Don't go all the way to the end
    
    // Random duration within the type's range
    const minDuration = selectedType.duration[0] * 60 * 1000; // Convert minutes to milliseconds
    const maxDuration = selectedType.duration[1] * 60 * 1000;
    const ticketDuration = minDuration + Math.random() * (maxDuration - minDuration);
    
    const ticketEndTime = Math.min(ticketStartTime + ticketDuration, endTime);
    
    // Add some variation to titles
    const variations = ['A', 'B', 'C', '1', '2', '3'];
    const variation = variations[Math.floor(Math.random() * variations.length)];
    
    tickets.push({
      id: `infinite-${scale}-${i}`,
      title: `${selectedType.title} ${variation}`,
      description: `Generated ${selectedType.title.toLowerCase()} for ${scale} view - Item ${i + 1}`,
      start: new Date(ticketStartTime),
      end: new Date(ticketEndTime),
      color: colors[Math.floor(Math.random() * colors.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
    });
  }
  
  return tickets;
};

// Generate tickets based on visible time range
export const generateTicketsForTimeRange = (startTime: number, endTime: number): Ticket[] => {
  // Combine sample tickets (always present) with infinite tickets for the time range
  const sampleTickets = generateSampleTickets();
  const infiniteTickets = generateInfiniteTickets(startTime, endTime);
  
  // Filter sample tickets to only include those that overlap with the visible range
  const filteredSampleTickets = sampleTickets.filter(ticket => {
    const ticketStart = ticket.start.getTime();
    const ticketEnd = ticket.end.getTime();
    return (ticketStart < endTime && ticketEnd > startTime);
  });
  
  return [...filteredSampleTickets, ...infiniteTickets];
};
