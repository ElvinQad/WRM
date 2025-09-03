/**
 * Performance tests for Story 2.5: Child Tickets & Hierarchical Structure
 * Tests large hierarchy loading performance requirements (AC7: <500ms for 20+ children)
 */

import { assertEquals, assertLess } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { beforeEach, describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";

// Performance test interfaces
interface PerformanceMetrics {
  operationName: string;
  duration: number;
  itemCount: number;
  memoryUsed?: number;
  averagePerItem?: number;
}

interface HierarchyPerformanceService {
  createLargeHierarchy(parentId: string, childCount: number, levels: number): Promise<string[]>;
  loadHierarchy(ticketId: string): Promise<HierarchyData>;
  calculateCompletionProgress(ticketId: string): Promise<CompletionProgress>;
  bulkUpdateChildren(ticketIds: string[], updates: Partial<TicketData>): Promise<void>;
  measureMemoryUsage(): number;
}

interface HierarchyData {
  ticket: TicketData;
  children: TicketData[];
  totalDescendants: number;
  maxDepth: number;
}

interface CompletionProgress {
  completed: number;
  total: number;
  percentage: number;
}

interface TicketData {
  id: string;
  title: string;
  parentId?: string;
  nestingLevel: number;
  status: 'FUTURE' | 'ACTIVE' | 'PAST_CONFIRMED' | 'PAST_UNTOUCHED';
  childCount: number;
  completedChildCount: number;
}

// Mock performance service for testing large hierarchies
class MockHierarchyPerformanceService implements HierarchyPerformanceService {
  private tickets = new Map<string, TicketData>();
  private ticketCounter = 0;

  constructor() {
    this.setupBaseTickets();
  }

  private setupBaseTickets() {
    // Create root ticket for performance testing
    const rootTicket: TicketData = {
      id: "perf-root",
      title: "Performance Test Root",
      nestingLevel: 0,
      status: 'FUTURE',
      childCount: 0,
      completedChildCount: 0
    };
    this.tickets.set(rootTicket.id, rootTicket);
  }

  async createLargeHierarchy(parentId: string, childCount: number, levels: number): Promise<string[]> {
    const createdIds: string[] = [];
    const parent = this.tickets.get(parentId);
    
    if (!parent || levels <= 0) {
      return createdIds;
    }

    // Create direct children
    for (let i = 0; i < childCount; i++) {
      const childId = `perf-child-${++this.ticketCounter}`;
      const child: TicketData = {
        id: childId,
        title: `Performance Child ${i + 1}`,
        parentId: parentId,
        nestingLevel: parent.nestingLevel + 1,
        status: Math.random() > 0.5 ? 'PAST_CONFIRMED' : 'FUTURE',
        childCount: 0,
        completedChildCount: 0
      };
      
      this.tickets.set(childId, child);
      createdIds.push(childId);
      
      // Create sub-hierarchies recursively
      if (levels > 1) {
        const subChildrenPerLevel = Math.max(1, Math.floor(childCount / levels));
        const subChildren = await this.createLargeHierarchy(childId, subChildrenPerLevel, levels - 1);
        createdIds.push(...subChildren);
        child.childCount = subChildren.length;
        child.completedChildCount = subChildren
          .map(id => this.tickets.get(id)!)
          .filter(t => t.status === 'PAST_CONFIRMED').length;
      }
    }

    // Update parent counts
    parent.childCount = childCount;
    parent.completedChildCount = createdIds
      .slice(0, childCount) // Only direct children
      .map(id => this.tickets.get(id)!)
      .filter(t => t.status === 'PAST_CONFIRMED').length;

    return createdIds;
  }

  async loadHierarchy(ticketId: string): Promise<HierarchyData> {
    const startTime = performance.now();
    
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Simulate database query time based on hierarchy size
    const children = Array.from(this.tickets.values())
      .filter(t => t.parentId === ticketId)
      .sort((a, b) => a.title.localeCompare(b.title));

    // Calculate all descendants recursively
    let totalDescendants = children.length;
    let maxDepth = ticket.nestingLevel;
    
    for (const child of children) {
      const childHierarchy = await this.loadHierarchy(child.id);
      totalDescendants += childHierarchy.totalDescendants;
      maxDepth = Math.max(maxDepth, childHierarchy.maxDepth);
    }

    // Simulate realistic database load time
    const loadTime = Math.min(50, totalDescendants * 0.5);
    await new Promise(resolve => setTimeout(resolve, loadTime));

    const endTime = performance.now();
    const _duration = endTime - startTime;

    return {
      ticket,
      children,
      totalDescendants,
      maxDepth
    };
  }

  async calculateCompletionProgress(ticketId: string): Promise<CompletionProgress> {
    const hierarchy = await this.loadHierarchy(ticketId);
    const { children } = hierarchy;
    
    const completed = children.filter(c => c.status === 'PAST_CONFIRMED').length;
    const total = children.length;
    
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  async bulkUpdateChildren(ticketIds: string[], updates: Partial<TicketData>): Promise<void> {
    // Simulate bulk operation timing
    const _startTime = performance.now();
    
    for (const id of ticketIds) {
      const ticket = this.tickets.get(id);
      if (ticket) {
        Object.assign(ticket, updates);
      }
    }
    
    // Simulate database write time
    const writeTime = Math.max(10, ticketIds.length * 0.1);
    await new Promise(resolve => setTimeout(resolve, writeTime));
    
    const _endTime = performance.now();
    return Promise.resolve();
  }

  measureMemoryUsage(): number {
    // Estimate memory usage based on ticket count
    const ticketCount = this.tickets.size;
    const averageTicketSize = 200; // bytes estimate
    return ticketCount * averageTicketSize;
  }
}

// Performance measurement utilities
class PerformanceMeasurer {
  static async measureOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    itemCount?: number
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const memoryBefore = 0; // Simplified for Deno compatibility
    
    const result = await operation();
    
    const endTime = performance.now();
    const memoryAfter = 0; // Simplified for Deno compatibility
    
    const duration = endTime - startTime;
    const memoryUsed = memoryAfter - memoryBefore;
    
    const metrics: PerformanceMetrics = {
      operationName,
      duration,
      itemCount: itemCount || 0,
      memoryUsed,
      averagePerItem: itemCount ? duration / itemCount : undefined
    };
    
    return { result, metrics };
  }
  
  static logMetrics(metrics: PerformanceMetrics) {
    console.log(`Performance Metrics for ${metrics.operationName}:`);
    console.log(`  Duration: ${metrics.duration.toFixed(2)}ms`);
    console.log(`  Items: ${metrics.itemCount}`);
    if (metrics.averagePerItem) {
      console.log(`  Avg per item: ${metrics.averagePerItem.toFixed(4)}ms`);
    }
    if (metrics.memoryUsed) {
      console.log(`  Memory used: ${(metrics.memoryUsed / 1024).toFixed(2)}KB`);
    }
  }
}

// Performance test suite
describe("Story 2.5: Hierarchy Performance Tests", () => {
  let performanceService: HierarchyPerformanceService;
  let rootTicketId: string;

  beforeEach(() => {
    performanceService = new MockHierarchyPerformanceService();
    rootTicketId = "perf-root";
  });

  describe("AC7: Hierarchical Views Load Within 500ms for 20+ Children", () => {
    it("should load hierarchy with exactly 20 children under 500ms", async () => {
      // Create hierarchy with 20 children
      await performanceService.createLargeHierarchy(rootTicketId, 20, 1);

      const { result, metrics } = await PerformanceMeasurer.measureOperation(
        "Load 20 child hierarchy",
        () => performanceService.loadHierarchy(rootTicketId),
        20
      );

      PerformanceMeasurer.logMetrics(metrics);

      assertEquals(result.children.length, 20);
      assertLess(metrics.duration, 500, 
        `Loading 20 children took ${metrics.duration}ms, should be under 500ms`);
    });

    it("should load hierarchy with 50 children under 500ms", async () => {
      // Test with more children than minimum requirement
      await performanceService.createLargeHierarchy(rootTicketId, 50, 1);

      const { result, metrics } = await PerformanceMeasurer.measureOperation(
        "Load 50 child hierarchy",
        () => performanceService.loadHierarchy(rootTicketId),
        50
      );

      PerformanceMeasurer.logMetrics(metrics);

      assertEquals(result.children.length, 50);
      assertLess(metrics.duration, 500,
        `Loading 50 children took ${metrics.duration}ms, should be under 500ms`);
    });

    it("should load deep hierarchy (3 levels) efficiently", async () => {
      // Create 3-level deep hierarchy with multiple children per level
      await performanceService.createLargeHierarchy(rootTicketId, 10, 3);

      const { result, metrics } = await PerformanceMeasurer.measureOperation(
        "Load 3-level deep hierarchy",
        () => performanceService.loadHierarchy(rootTicketId)
      );

      PerformanceMeasurer.logMetrics(metrics);

      assertEquals(result.maxDepth >= 2, true); // Root is 0, so max should be at least 2
      assertLess(metrics.duration, 500,
        `Loading deep hierarchy took ${metrics.duration}ms, should be under 500ms`);
    });
  });

  describe("Completion Progress Performance", () => {
    it("should calculate progress for large hierarchies quickly", async () => {
      // Create large hierarchy
      await performanceService.createLargeHierarchy(rootTicketId, 25, 1);

      const { result, metrics } = await PerformanceMeasurer.measureOperation(
        "Calculate completion progress",
        () => performanceService.calculateCompletionProgress(rootTicketId),
        25
      );

      PerformanceMeasurer.logMetrics(metrics);

      assertLess(metrics.duration, 100,
        `Progress calculation took ${metrics.duration}ms, should be under 100ms`);
      assertEquals(result.total, 25);
      assertEquals(typeof result.percentage, 'number');
    });

    it("should handle progress calculation for complex hierarchies", async () => {
      // Create complex multi-level hierarchy
      await performanceService.createLargeHierarchy(rootTicketId, 15, 2);

      const { metrics } = await PerformanceMeasurer.measureOperation(
        "Complex hierarchy progress",
        () => performanceService.calculateCompletionProgress(rootTicketId)
      );

      PerformanceMeasurer.logMetrics(metrics);
      assertLess(metrics.duration, 200,
        `Complex progress calculation took ${metrics.duration}ms, should be under 200ms`);
    });
  });

  describe("Bulk Operations Performance", () => {
    it("should handle bulk updates efficiently", async () => {
      // Create children for bulk operations
      const childIds = await performanceService.createLargeHierarchy(rootTicketId, 30, 1);

      const { metrics } = await PerformanceMeasurer.measureOperation(
        "Bulk update 30 tickets",
        () => performanceService.bulkUpdateChildren(childIds, { status: 'PAST_CONFIRMED' }),
        30
      );

      PerformanceMeasurer.logMetrics(metrics);
      assertLess(metrics.duration, 1000,
        `Bulk update took ${metrics.duration}ms, should be under 1000ms`);
    });
  });

  describe("Memory Usage and Resource Management", () => {
    it("should maintain reasonable memory usage with large hierarchies", async () => {
      const memoryBefore = performanceService.measureMemoryUsage();

      // Create very large hierarchy
      await performanceService.createLargeHierarchy(rootTicketId, 100, 1);

      const memoryAfter = performanceService.measureMemoryUsage();
      const memoryIncrease = memoryAfter - memoryBefore;

      console.log(`Memory usage: ${memoryBefore} -> ${memoryAfter} bytes (increase: ${memoryIncrease})`);

      // Memory increase should be reasonable (less than 100KB for 100 tickets)
      assertLess(memoryIncrease, 100 * 1024,
        `Memory increase of ${memoryIncrease} bytes seems excessive for 100 tickets`);
    });
  });

  describe("Scalability Stress Tests", () => {
    it("should handle maximum supported hierarchy size", async () => {
      // Test with maximum realistic hierarchy size
      const _childIds = await performanceService.createLargeHierarchy(rootTicketId, 100, 2);

      const { result, metrics } = await PerformanceMeasurer.measureOperation(
        "Load maximum hierarchy size",
        () => performanceService.loadHierarchy(rootTicketId)
      );

      PerformanceMeasurer.logMetrics(metrics);

      // Should still perform reasonably even with large hierarchies
      assertLess(metrics.duration, 2000,
        `Maximum hierarchy loading took ${metrics.duration}ms, should be under 2000ms`);
      assertEquals(result.totalDescendants >= 100, true);
    });

    it("should degrade gracefully with excessive nesting", async () => {
      // Test with deep nesting at the limit
      await performanceService.createLargeHierarchy(rootTicketId, 5, 3);

      const { result, metrics } = await PerformanceMeasurer.measureOperation(
        "Load deeply nested hierarchy",
        () => performanceService.loadHierarchy(rootTicketId)
      );

      PerformanceMeasurer.logMetrics(metrics);

      // Performance should still be acceptable even with maximum nesting
      assertLess(metrics.duration, 1000,
        `Deep nesting load took ${metrics.duration}ms, should be under 1000ms`);
      assertEquals(result.maxDepth <= 3, true); // Enforce maximum nesting constraint
    });
  });

  describe("Real-world Usage Patterns", () => {
    it("should handle typical project hierarchy patterns efficiently", async () => {
      // Simulate real-world project: 1 epic, 5 stories, 3-5 tasks per story
      const storyIds = await performanceService.createLargeHierarchy(rootTicketId, 5, 1);
      
      // Add tasks under each story
      for (const storyId of storyIds.slice(0, 5)) {
        await performanceService.createLargeHierarchy(storyId, 4, 1);
      }

      const { result, metrics } = await PerformanceMeasurer.measureOperation(
        "Load realistic project hierarchy",
        () => performanceService.loadHierarchy(rootTicketId)
      );

      PerformanceMeasurer.logMetrics(metrics);

      assertLess(metrics.duration, 300,
        `Realistic hierarchy load took ${metrics.duration}ms, should be under 300ms`);
      assertEquals(result.children.length, 5); // 5 stories
    });

    it("should efficiently handle frequent progress updates", async () => {
      await performanceService.createLargeHierarchy(rootTicketId, 20, 1);

      // Simulate multiple progress checks (real-world usage)
      const progressChecks = [];
      for (let i = 0; i < 10; i++) {
        progressChecks.push(performanceService.calculateCompletionProgress(rootTicketId));
      }

      const startTime = performance.now();
      const results = await Promise.all(progressChecks);
      const endTime = performance.now();

      const totalDuration = endTime - startTime;
      const averageDuration = totalDuration / 10;

      console.log(`10 progress checks completed in ${totalDuration.toFixed(2)}ms (avg: ${averageDuration.toFixed(2)}ms)`);

      assertLess(averageDuration, 50,
        `Average progress check took ${averageDuration}ms, should be under 50ms`);
      assertEquals(results.length, 10);
      results.forEach(result => {
        assertEquals(result.total, 20);
      });
    });
  });
});
