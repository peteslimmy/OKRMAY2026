/**
 * Performance optimization utilities for the OKR application
 * Implements caching and performance monitoring
 */

import { logger, logPerformance } from '@/utils/logging';
import { dbCache, httpCache } from '@/utils/cache';

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private startTime: number | null = null;
  private operation: string | null = null;
  
  private constructor() {}
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Start timing an operation
   */
  start(operation: string): void {
    this.startTime = performance.now();
    this.operation = operation;
    logger.info(`Starting operation: ${operation}`);
  }
  
  /**
   * End timing and log performance
   */
  end(): void {
    if (this.startTime && this.operation) {
      const endTime = performance.now();
      const duration = endTime - this.startTime;
      logPerformance(this.operation, duration);
      this.startTime = null;
      this.operation = null;
    }
  }
  
  /**
   * Clear all caches
   */
  clearCaches(): void {
    dbCache.clear();
    httpCache.clear();
    logger.info('Cleared all caches');
  }
}

// Export singleton instance
export const perfMonitor = PerformanceMonitor.getInstance();