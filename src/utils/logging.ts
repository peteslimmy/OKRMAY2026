/**
 * Logging utilities for the OKR application
 * Implements structured logging with different log levels
 */

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  component?: string;
}

// Logger class
export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = 'info';
  private logEntries: LogEntry[] = [];

  private constructor() {
    // Set log level based on environment
    this.logLevel = import.meta.env.PROD ? 'error' : 'debug';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set the minimum log level to display
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Generic log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    // Only log if level is appropriate
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context
    };

    // Add to log entries
    this.logEntries.push(logEntry);

    // Keep only last 1000 entries
    if (this.logEntries.length > 1000) {
      this.logEntries = this.logEntries.slice(-1000);
    }

    // Output to console
    this.outputToConsole(logEntry);
  }

  /**
   * Check if we should log based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    const currentLevel = this.logLevel;
    return levels[level] >= levels[currentLevel];
  }

  /**
   * Output log to console
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase();
    const message = `[${timestamp}] [${level}] ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
        console.error(message);
        break;
      default:
        console.log(message);
    }

    if (entry.context) {
      console.log('Context:', entry.context);
    }
  }

  /**
   * Get all log entries
   */
  getLogs(): LogEntry[] {
    return [...this.logEntries];
  }

  /**
   * Clear all log entries
   */
  clearLogs(): void {
    this.logEntries = [];
  }

  /**
   * Export logs to CSV
   */
  exportToCSV(): string {
    const headers = 'Timestamp,Level,Message,Context\n';
    const rows = this.logEntries.map(entry => {
      const contextStr = entry.context ? JSON.stringify(entry.context) : '';
      return `${entry.timestamp.toISOString()},${entry.level},"${entry.message}","${contextStr}"`;
    }).join('\n');

    return headers + rows;
  }
}

// Create a default logger instance
export const logger = Logger.getInstance();

// Utility functions for common logging scenarios

/**
 * Log user authentication events
 */
export const logAuthEvent = (
  event: string,
  userId: string,
  details?: Record<string, unknown>
): void => {
  logger.info(`[AUTH] ${event}`, {
    userId,
    ...details
  });
};

/**
 * Log API requests
 */
export const logAPIRequest = (
  method: string,
  url: string,
  userId?: string,
  details?: Record<string, unknown>
): void => {
  logger.info(`[API] ${method} ${url}`, {
    userId,
    ...details
  });
};

/**
 * Log database operations
 */
export const logDBOperation = (
  operation: string,
  table: string,
  details?: Record<string, unknown>
): void => {
  logger.info(`[DB] ${operation} on ${table}`, details);
};

/**
 * Log cache operations
 */
export const logCacheOperation = (
  operation: string,
  key: string,
  details?: Record<string, unknown>
): void => {
  logger.debug(`[CACHE] ${operation} for key ${key}`, details);
};

/**
 * Log error events
 */
export const logError = (
  error: Error,
  context?: Record<string, unknown>
): void => {
  logger.error(`[ERROR] ${error.name}: ${error.message}`, {
    stack: error.stack,
    ...context
  });
};

/**
 * Log security events
 */
export const logSecurityEvent = (
  event: string,
  details?: Record<string, unknown>
): void => {
  logger.warn(`[SECURITY] ${event}`, details);
};

/**
 * Log performance metrics
 */
export const logPerformance = (
  operation: string,
  duration: number,
  details?: Record<string, unknown>
): void => {
  logger.info(`[PERF] ${operation} took ${duration}ms`, {
    duration,
    ...details
  });
};

/**
 * Log user actions
 */
export const logUserAction = (
  action: string,
  userId: string,
  details?: Record<string, unknown>
): void => {
  logger.info(`[USER] ${action}`, {
    userId,
    ...details
  });
};

/**
 * Log system events
 */
export const logSystemEvent = (
  event: string,
  details?: Record<string, unknown>
): void => {
  logger.info(`[SYSTEM] ${event}`, details);
};

/**
 * Log configuration changes
 */
export const logConfigChange = (
  config: string,
  oldValue: any,
  newValue: any,
  userId?: string
): void => {
  logger.info(`[CONFIG] ${config} changed`, {
    oldValue,
    newValue,
    userId
  });
};

/**
 * Log feature usage
 */
export const logFeatureUsage = (
  feature: string,
  userId?: string,
  details?: Record<string, unknown>
): void => {
  logger.info(`[FEATURE] ${feature} used`, {
    userId,
    ...details
  });
};

/**
 * Log audit events
 */
export const logAuditEvent = (
  action: string,
  userId: string,
  details?: Record<string, unknown>
): void => {
  logger.info(`[AUDIT] ${action}`, {
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Export all utility functions (already exported individually above)