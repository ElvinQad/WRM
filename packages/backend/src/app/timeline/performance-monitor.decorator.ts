import { Logger } from '@nestjs/common';

interface PerformanceMetrics {
  method: string;
  duration: number;
  timestamp: number;
  params?: Record<string, unknown>;
  result?: {
    success: boolean;
    dataSize?: number;
    errorMessage?: string;
  };
}

/**
 * Performance monitoring decorator for timeline operations
 * Implements AC 4: Performance monitoring and logging
 */
export function MonitorPerformance(logParams = false, _logResult = false) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const logger = new Logger(`${target?.constructor?.name || 'Unknown'}.${propertyName}`);

    descriptor.value = async function (...args: unknown[]) {
      const startTime = performance.now();
      const timestamp = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = performance.now() - startTime;
        
        const metrics: PerformanceMetrics = {
          method: `${target?.constructor?.name || 'Unknown'}.${propertyName}`,
          duration: Math.round(duration * 100) / 100,
          timestamp,
          result: {
            success: true,
            dataSize: typeof result === 'object' && result !== null 
              ? JSON.stringify(result).length 
              : undefined,
          },
        };

        if (logParams && args.length > 0) {
          metrics.params = args.reduce((acc: Record<string, unknown>, arg: unknown, index: number) => {
            acc[`arg${index}`] = typeof arg === 'object' && arg !== null 
              ? JSON.stringify(arg).substring(0, 100) + '...' 
              : String(arg);
            return acc;
          }, {} as Record<string, unknown>);
        }

        // Log performance metrics
        if (duration > 1000) { // Log as warning if > 1 second
          logger.warn(`SLOW OPERATION: ${propertyName} took ${duration.toFixed(2)}ms`, metrics);
        } else if (duration > 200) { // Log as info if > 200ms (AC 4 target)
          logger.log(`PERFORMANCE: ${propertyName} took ${duration.toFixed(2)}ms`, metrics);
        } else {
          logger.debug(`PERFORMANCE: ${propertyName} took ${duration.toFixed(2)}ms`, metrics);
        }

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        const metrics: PerformanceMetrics = {
          method: `${target?.constructor?.name || 'Unknown'}.${propertyName}`,
          duration: Math.round(duration * 100) / 100,
          timestamp,
          result: {
            success: false,
            errorMessage: error instanceof Error ? error.message : String(error),
          },
        };

        logger.error(`ERROR: ${propertyName} failed after ${duration.toFixed(2)}ms`, metrics);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Performance monitoring for timeline cache operations
 */
export function MonitorCachePerformance() {
  return MonitorPerformance(true, false); // Log params but not full result
}

/**
 * Performance monitoring for database operations
 */
export function MonitorDatabasePerformance() {
  return MonitorPerformance(true, true); // Log params and result size
}
