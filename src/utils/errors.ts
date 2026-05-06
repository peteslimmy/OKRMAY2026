/**
 * Comprehensive error handling system for the OKR application
 * Implements structured error handling with context and logging
 */

// Error types
export type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'DATABASE_ERROR'
  | 'VALIDATION_ERROR'
  | 'BUSINESS_LOGIC_ERROR'
  | 'SECURITY_ERROR';

// Error interface
export interface AppError extends Error {
  type: ErrorType;
  context?: Record<string, unknown>;
  statusCode?: number;
  isOperational?: boolean;
  service?: string;
}

// Custom error classes
export class ValidationError extends Error implements AppError {
  type: ErrorType = 'VALIDATION_ERROR';
  context?: Record<string, unknown>;
  statusCode?: number = 400;
  isOperational: boolean = true;
  service?: string;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ValidationError';
    this.context = context;
  }
}

export class AuthenticationError extends Error implements AppError {
  type: ErrorType = 'AUTHENTICATION_ERROR';
  statusCode?: number = 401;
  isOperational: boolean = true;
  service?: string;
  
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements AppError {
  type: ErrorType = 'AUTHORIZATION_ERROR';
  statusCode?: number = 403;
  isOperational: boolean = true;
  service?: string;
  
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements AppError {
  type: ErrorType = 'NOT_FOUND_ERROR';
  statusCode?: number = 404;
  isOperational: boolean = true;
  service?: string;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'NotFoundError';
    this.context = context;
  }
}

export class ConflictError extends Error implements AppError {
  type: ErrorType = 'CONFLICT_ERROR';
  statusCode?: number = 409;
  isOperational: boolean = true;
  service?: string;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ConflictError';
    this.context = context;
  }
}

export class ServerError extends Error implements AppError {
  type: ErrorType = 'SERVER_ERROR';
  statusCode?: number = 500;
  isOperational: boolean = false;
  service?: string;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'ServerError';
    this.context = context;
  }
}

export class NetworkError extends Error implements AppError {
  type: ErrorType = 'NETWORK_ERROR';
  statusCode?: number = 503;
  isOperational: boolean = false;
  service?: string;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'NetworkError';
    this.context = context;
  }
}

export class DatabaseError extends Error implements AppError {
  type: ErrorType = 'DATABASE_ERROR';
  statusCode?: number = 500;
  isOperational: boolean = false;
  service?: string;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'DatabaseError';
    this.context = context;
  }
}

export class BusinessLogicError extends Error implements AppError {
  type: ErrorType = 'BUSINESS_LOGIC_ERROR';
  statusCode?: number = 422;
  isOperational: boolean = true;
  service?: string;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'BusinessLogicError';
    this.context = context;
  }
}

export class SecurityError extends Error implements AppError {
  type: ErrorType = 'SECURITY_ERROR';
  statusCode?: number = 403;
  isOperational: boolean = true;
  service?: string;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'SecurityError';
    this.context = context;
  }
}

// Error handler class
export class ErrorHandler {
  static handleError(error: AppError): void {
    console.error(`[${error.name}] ${error.message}`, {
      context: error.context,
      stack: error.stack,
      service: error.service
    });
    
    // In production, we might want to send to error tracking service
    if (import.meta.env.PROD) {
      // Here you would typically send to an error tracking service
      // For example: Sentry, Bugsnag, etc.
    }
  }
  
  static isOperational(error: Error): boolean {
    return 'isOperational' in error ? error.isOperational : false;
  }
  
  static getStatusCode(error: AppError): number {
    return error.statusCode || 500;
  }
}

// Error boundary for React components
export class ErrorBoundary extends Error {
  constructor(message: string, type: ErrorType = 'SERVER_ERROR') {
    super(message);
    this.name = 'ErrorBoundary';
  }
}

// Utility function to create errors with context
export const createError = (
  type: ErrorType,
  message: string,
  context?: Record<string, unknown>
): AppError => {
  const errorMap: Record<ErrorType, new (msg: string, ctx?: Record<string, unknown>) => AppError> = {
    VALIDATION_ERROR: ValidationError,
    AUTHENTICATION_ERROR: AuthenticationError,
    AUTHORIZATION_ERROR: AuthorizationError,
    NOT_FOUND_ERROR: NotFoundError,
    CONFLICT_ERROR: ConflictError,
    SERVER_ERROR: ServerError,
    NETWORK_ERROR: NetworkError,
    DATABASE_ERROR: DatabaseError,
    BUSINESS_LOGIC_ERROR: BusinessLogicError,
    SECURITY_ERROR: SecurityError,
  };
  
  const ErrorClass = errorMap[type];
  const error = new ErrorClass(message);
  error.context = context;
  return error;
};

// Global error handler
export const handleGlobalError = (error: Error) => {
  if (error instanceof Error) {
    console.error('Global error handler:', error.message);
  }
};

// Promise error handler
export const handlePromiseError = (promise: Promise<any>) => {
  return promise.catch((error: Error) => {
    console.error('Promise error:', error);
    throw error;
  });
};

// Input validation error creator
export const createValidationError = (field: string, message: string, value?: any) => {
  return new ValidationError(
    `Validation failed for ${field}: ${message}`,
    { field, value, message }
  );
};

// Database error creator
export const createDatabaseError = (operation: string, entity: string, error: any) => {
  return new DatabaseError(
    `Database operation failed: ${operation} on ${entity}`,
    { operation, entity, error }
  );
};

// Business logic error creator
export const createBusinessLogicError = (operation: string, reason: string) => {
  return new BusinessLogicError(
    `Business logic error in ${operation}: ${reason}`,
    { operation, reason }
  );
};

// Security error creator
export const createSecurityError = (operation: string, reason: string) => {
  return new SecurityError(
    `Security error in ${operation}: ${reason}`,
    { operation, reason }
  );
};

// Authentication error creator
export const createAuthenticationError = (message: string) => {
  return new AuthenticationError(message);
};

// Authorization error creator
export const createAuthorizationError = (message: string) => {
  return new AuthorizationError(message);
};

// Not found error creator
export const createNotFoundError = (entity: string, id?: string) => {
  return new NotFoundError(
    `Entity not found: ${entity}${id ? ` with id ${id}` : ''}`,
    { entity, id }
  );
};

// Conflict error creator
export const createConflictError = (entity: string, conflict: string) => {
  return new ConflictError(
    `Conflict with ${entity}: ${conflict}`,
    { entity, conflict }
  );
};

// Server error creator
export const createServerError = (message: string, context?: Record<string, unknown>) => {
  return new ServerError(message, context);
};

// Network error creator
export const createNetworkError = (message: string, context?: Record<string, unknown>) => {
  return new NetworkError(message, context);
};