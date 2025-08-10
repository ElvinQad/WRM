import { assertEquals } from "jsr:@std/assert";

// Test recurrence calculation logic
function calculateNextOccurrence(date: Date, frequency: string, interval: number): Date {
  const nextDate = new Date(date);

  switch (frequency) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + (interval * 7));
      break;
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'CUSTOM':
      // For custom frequency, treat interval as days
      nextDate.setDate(nextDate.getDate() + interval);
      break;
  }

  return nextDate;
}

// Test recurrence pattern validation
function validateRecurrencePattern(frequency: string, interval: number, endDate?: Date, maxOccurrences?: number): boolean {
  // Basic validation rules
  if (!['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'].includes(frequency)) {
    return false;
  }

  if (interval < 1 || interval > 365) {
    return false;
  }

  if (maxOccurrences !== undefined && (maxOccurrences < 1 || maxOccurrences > 9999)) {
    return false;
  }

  if (endDate && endDate <= new Date()) {
    return false;
  }

  return true;
}

Deno.test("Recurrence Pattern Calculation Tests", async (t) => {
  await t.step("should calculate daily recurrence correctly", () => {
    const startDate = new Date('2025-08-10T09:00:00Z');
    const nextDate = calculateNextOccurrence(startDate, 'DAILY', 1);
    
    assertEquals(nextDate.toISOString(), '2025-08-11T09:00:00.000Z');
  });

  await t.step("should calculate weekly recurrence correctly", () => {
    const startDate = new Date('2025-08-10T09:00:00Z');
    const nextDate = calculateNextOccurrence(startDate, 'WEEKLY', 2);
    
    assertEquals(nextDate.toISOString(), '2025-08-24T09:00:00.000Z');
  });

  await t.step("should calculate monthly recurrence correctly", () => {
    const startDate = new Date('2025-08-10T09:00:00Z');
    const nextDate = calculateNextOccurrence(startDate, 'MONTHLY', 1);
    
    assertEquals(nextDate.toISOString(), '2025-09-10T09:00:00.000Z');
  });

  await t.step("should validate recurrence patterns correctly", () => {
    // Valid patterns - test each one individually
    assertEquals(validateRecurrencePattern('DAILY', 1), true, "DAILY pattern should be valid");
    assertEquals(validateRecurrencePattern('WEEKLY', 2), true, "WEEKLY pattern should be valid");
    assertEquals(validateRecurrencePattern('MONTHLY', 1, new Date('2025-12-31')), true, "MONTHLY pattern with end date should be valid");
    assertEquals(validateRecurrencePattern('DAILY', 1, undefined, 10), true, "DAILY pattern with max occurrences should be valid");

    // Invalid patterns - test each one individually  
    assertEquals(validateRecurrencePattern('INVALID', 1), false, "Invalid frequency should be rejected");
    assertEquals(validateRecurrencePattern('DAILY', 0), false, "Zero interval should be rejected");
    assertEquals(validateRecurrencePattern('DAILY', 400), false, "Interval > 365 should be rejected");
    assertEquals(validateRecurrencePattern('DAILY', 1, undefined, 0), false, "Zero max occurrences should be rejected");
    assertEquals(validateRecurrencePattern('DAILY', 1, undefined, 10000), false, "Max occurrences > 9999 should be rejected");
  });

  await t.step("should generate multiple occurrences with skip dates", () => {
    const startDate = new Date('2025-08-10T09:00:00Z');
    const skipDates = [new Date('2025-08-12T09:00:00Z'), new Date('2025-08-14T09:00:00Z')];
    const occurrences: Date[] = [];
    
    let currentDate = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      currentDate = calculateNextOccurrence(currentDate, 'DAILY', 1);
      
      // Skip if date is in skip list
      if (!skipDates.some(skipDate => skipDate.toDateString() === currentDate.toDateString())) {
        occurrences.push(new Date(currentDate));
      }
    }

    assertEquals(occurrences.length, 5); // 7 - 2 skipped dates
    assertEquals(occurrences[0].toISOString(), '2025-08-11T09:00:00.000Z');
    assertEquals(occurrences[1].toISOString(), '2025-08-13T09:00:00.000Z');
    assertEquals(occurrences[2].toISOString(), '2025-08-15T09:00:00.000Z');
  });

  await t.step("should respect end date limits", () => {
    const startDate = new Date('2025-08-10T09:00:00Z');
    const endDate = new Date('2025-08-15T09:00:00Z');
    const occurrences: Date[] = [];
    
    let currentDate = new Date(startDate);
    for (let i = 0; i < 10; i++) {
      currentDate = calculateNextOccurrence(currentDate, 'DAILY', 1);
      
      if (currentDate > endDate) break;
      
      occurrences.push(new Date(currentDate));
    }

    assertEquals(occurrences.length, 5); // Only 5 days within the limit
    assertEquals(occurrences[occurrences.length - 1].toISOString(), '2025-08-15T09:00:00.000Z');
  });

  await t.step("should respect occurrence limits", () => {
    const startDate = new Date('2025-08-10T09:00:00Z');
    const maxOccurrences = 3;
    const occurrences: Date[] = [];
    
    let currentDate = new Date(startDate);
    for (let i = 0; i < maxOccurrences; i++) {
      currentDate = calculateNextOccurrence(currentDate, 'DAILY', 1);
      occurrences.push(new Date(currentDate));
    }

    assertEquals(occurrences.length, maxOccurrences);
    assertEquals(occurrences[0].toISOString(), '2025-08-11T09:00:00.000Z');
    assertEquals(occurrences[1].toISOString(), '2025-08-12T09:00:00.000Z');
    assertEquals(occurrences[2].toISOString(), '2025-08-13T09:00:00.000Z');
  });

  await t.step("should handle custom frequency with different intervals", () => {
    const startDate = new Date('2025-08-10T09:00:00Z');
    
    // Test custom frequency with 3-day intervals
    let currentDate = new Date(startDate);
    const occurrences3Days: Date[] = [];
    
    for (let i = 0; i < 3; i++) {
      currentDate = calculateNextOccurrence(currentDate, 'CUSTOM', 3);
      occurrences3Days.push(new Date(currentDate));
    }

    assertEquals(occurrences3Days.length, 3);
    assertEquals(occurrences3Days[0].toISOString(), '2025-08-13T09:00:00.000Z'); // 3 days later
    assertEquals(occurrences3Days[1].toISOString(), '2025-08-16T09:00:00.000Z'); // 6 days later  
    assertEquals(occurrences3Days[2].toISOString(), '2025-08-19T09:00:00.000Z'); // 9 days later

    // Test custom frequency with 7-day intervals (same as weekly)
    currentDate = new Date(startDate);
    const occurrences7Days: Date[] = [];
    
    for (let i = 0; i < 2; i++) {
      currentDate = calculateNextOccurrence(currentDate, 'CUSTOM', 7);
      occurrences7Days.push(new Date(currentDate));
    }

    assertEquals(occurrences7Days.length, 2);
    assertEquals(occurrences7Days[0].toISOString(), '2025-08-17T09:00:00.000Z'); // 7 days later
    assertEquals(occurrences7Days[1].toISOString(), '2025-08-24T09:00:00.000Z'); // 14 days later
  });

  await t.step("should validate custom frequency patterns correctly", () => {
    // Valid custom patterns
    assertEquals(validateRecurrencePattern('CUSTOM', 1), true);
    assertEquals(validateRecurrencePattern('CUSTOM', 3), true);
    assertEquals(validateRecurrencePattern('CUSTOM', 7), true);
    assertEquals(validateRecurrencePattern('CUSTOM', 30), true);

    // Invalid intervals for custom frequency
    assertEquals(validateRecurrencePattern('CUSTOM', 0), false); // Too small
    assertEquals(validateRecurrencePattern('CUSTOM', 366), false); // Too large
    assertEquals(validateRecurrencePattern('CUSTOM', -1), false); // Negative

    // Valid custom with end date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    assertEquals(validateRecurrencePattern('CUSTOM', 5, futureDate), true);

    // Valid custom with max occurrences
    assertEquals(validateRecurrencePattern('CUSTOM', 5, undefined, 10), true);
  });
});
