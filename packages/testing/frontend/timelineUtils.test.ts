import { assertEquals, assertAlmostEquals } from "https://deno.land/std@0.210.0/testing/asserts.ts";
import { 
  calculateDailyDateRange,
  calculateWeeklyDateRange,
  calculateSelectiveDateRange 
} from '../../frontend/src/components/timeline/utils/timelineUtils.ts';

Deno.test("Timeline Utilities - Date Range Calculations", async (t) => {
  await t.step("calculateDailyDateRange", async (st) => {
    await st.step("should calculate 48-hour window (12h yesterday + 24h today + 12h tomorrow)", () => {
      // Test with a specific date: Tuesday, August 6, 2025, 12:00 PM
      const baseDate = new Date('2025-08-06T12:00:00.000Z');
      const { start, end } = calculateDailyDateRange(baseDate);
      
      // Start should be 12 hours before baseDate (Tuesday 12:00 AM)
      const expectedStart = new Date('2025-08-06T00:00:00.000Z');
      // End should be 36 hours after baseDate (Thursday 12:00 AM)
      const expectedEnd = new Date('2025-08-08T00:00:00.000Z');
      
      assertEquals(start.getTime(), expectedStart.getTime());
      assertEquals(end.getTime(), expectedEnd.getTime());
      
      // Verify it's exactly 48 hours (2 days)
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      assertEquals(durationHours, 48);
    });

    await st.step("should work with different base dates", () => {
      // Test with a different date: Friday, August 1, 2025, 6:00 AM
      const baseDate = new Date('2025-08-01T06:00:00.000Z');
      const { start, end } = calculateDailyDateRange(baseDate);
      
      // Start should be 12 hours before (Thursday 6:00 PM)
      const expectedStart = new Date('2025-07-31T18:00:00.000Z');
      // End should be 36 hours after (Saturday 6:00 PM)
      const expectedEnd = new Date('2025-08-02T18:00:00.000Z');
      
      assertEquals(start.getTime(), expectedStart.getTime());
      assertEquals(end.getTime(), expectedEnd.getTime());
    });

    await st.step("should default to current date if no base date provided", () => {
      const before = Date.now();
      const { start, end } = calculateDailyDateRange();
      const after = Date.now();
      
      // Should use a date between before and after
      const actualBaseTime = start.getTime() + 12 * 60 * 60 * 1000; // Add back the 12 hours
      assertAlmostEquals(actualBaseTime, before, after - before + 1000); // Allow some variance
      
      // Duration should still be 48 hours
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      assertEquals(durationHours, 48);
    });
  });

  await t.step("calculateWeeklyDateRange", async (st) => {
    await st.step("should calculate 2-week window (current week + next week)", () => {
      // Test with Wednesday, August 6, 2025
      const baseDate = new Date('2025-08-06T12:00:00.000Z');
      const { start, end } = calculateWeeklyDateRange(baseDate);
      
      // Start should be Sunday of current week (August 3, 2025, 00:00)
      const expectedStart = new Date('2025-08-03T00:00:00.000Z');
      // End should be 14 days later (August 17, 2025, 00:00)
      const expectedEnd = new Date('2025-08-17T00:00:00.000Z');
      
      assertEquals(start.getTime(), expectedStart.getTime());
      assertEquals(end.getTime(), expectedEnd.getTime());
      
      // Verify it's exactly 14 days (2 weeks)
      const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      assertEquals(durationDays, 14);
    });

    await st.step("should handle Sunday as start of week correctly", () => {
      // Test with Sunday, August 3, 2025
      const baseDate = new Date('2025-08-03T12:00:00.000Z');
      const { start, end } = calculateWeeklyDateRange(baseDate);
      
      // Start should be the same Sunday (August 3, 2025, 00:00)
      const expectedStart = new Date('2025-08-03T00:00:00.000Z');
      // End should be 14 days later (August 17, 2025, 00:00)
      const expectedEnd = new Date('2025-08-17T00:00:00.000Z');
      
      assertEquals(start.getTime(), expectedStart.getTime());
      assertEquals(end.getTime(), expectedEnd.getTime());
    });

    await st.step("should handle Saturday correctly", () => {
      // Test with Saturday, August 9, 2025
      const baseDate = new Date('2025-08-09T12:00:00.000Z');
      const { start, end } = calculateWeeklyDateRange(baseDate);
      
      // Start should be Sunday of current week (August 3, 2025, 00:00)
      const expectedStart = new Date('2025-08-03T00:00:00.000Z');
      // End should be 14 days later (August 17, 2025, 00:00)
      const expectedEnd = new Date('2025-08-17T00:00:00.000Z');
      
      assertEquals(start.getTime(), expectedStart.getTime());
      assertEquals(end.getTime(), expectedEnd.getTime());
    });

    await st.step("should default to current date if no base date provided", () => {
      const { start, end } = calculateWeeklyDateRange();
      
      // Start should be start of current week (00:00:00)
      assertEquals(start.getHours(), 0);
      assertEquals(start.getMinutes(), 0);
      assertEquals(start.getSeconds(), 0);
      assertEquals(start.getMilliseconds(), 0);
      
      // Duration should be exactly 14 days
      const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      assertEquals(durationDays, 14);
    });
  });

  await t.step("calculateSelectiveDateRange", async (st) => {
    await st.step("should return daily range for daily view", () => {
      const baseDate = new Date('2025-08-06T12:00:00.000Z');
      const dailyRange = calculateDailyDateRange(baseDate);
      const selectiveRange = calculateSelectiveDateRange('daily', baseDate);
      
      assertEquals(selectiveRange.start.getTime(), dailyRange.start.getTime());
      assertEquals(selectiveRange.end.getTime(), dailyRange.end.getTime());
    });

    await st.step("should return weekly range for weekly view", () => {
      const baseDate = new Date('2025-08-06T12:00:00.000Z');
      const weeklyRange = calculateWeeklyDateRange(baseDate);
      const selectiveRange = calculateSelectiveDateRange('weekly', baseDate);
      
      assertEquals(selectiveRange.start.getTime(), weeklyRange.start.getTime());
      assertEquals(selectiveRange.end.getTime(), weeklyRange.end.getTime());
    });

    await st.step("should default to daily range for invalid view", () => {
      const baseDate = new Date('2025-08-06T12:00:00.000Z');
      const dailyRange = calculateDailyDateRange(baseDate);
      // @ts-expect-error Testing invalid view type
      const selectiveRange = calculateSelectiveDateRange('invalid', baseDate);
      
      assertEquals(selectiveRange.start.getTime(), dailyRange.start.getTime());
      assertEquals(selectiveRange.end.getTime(), dailyRange.end.getTime());
    });

    await st.step("should default to current date if no base date provided", () => {
      const { start, end } = calculateSelectiveDateRange('daily');
      
      // Duration should be 48 hours for daily view
      const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      assertEquals(durationHours, 48);
    });
  });

  // Additional tests for week boundary calculations
  await t.step("Week boundary calculations", async (st) => {
    await st.step("should calculate week boundaries correctly for different months", () => {
      // Test date at the end of a month: July 31, 2025 (Thursday)
      const baseDate = new Date('2025-07-31T12:00:00.000Z');
      const { start, end } = calculateWeeklyDateRange(baseDate);
      
      // Start should be Sunday, July 27, 2025
      const expectedStart = new Date('2025-07-27T00:00:00.000Z');
      // End should be Sunday, August 10, 2025
      const expectedEnd = new Date('2025-08-10T00:00:00.000Z');
      
      assertEquals(start.getTime(), expectedStart.getTime());
      assertEquals(end.getTime(), expectedEnd.getTime());
    });

    await st.step("should handle year boundaries correctly", () => {
      // Test date near year boundary: January 2, 2026 (Friday)
      const baseDate = new Date('2026-01-02T12:00:00.000Z');
      const { start, end } = calculateWeeklyDateRange(baseDate);
      
      // Start should be Sunday, December 28, 2025
      const expectedStart = new Date('2025-12-28T00:00:00.000Z');
      // End should be Sunday, January 11, 2026
      const expectedEnd = new Date('2026-01-11T00:00:00.000Z');
      
      assertEquals(start.getTime(), expectedStart.getTime());
      assertEquals(end.getTime(), expectedEnd.getTime());
    });
  });
});
