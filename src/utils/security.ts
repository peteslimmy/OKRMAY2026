/**
 * Security utilities for the OKR application
 * Implements input validation, sanitization, and security best practices
 */

import { UserRole } from '../types';

// Regular expression for validating email format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regular expression for validating input to prevent injection attacks
const INJECTION_REGEX = /[<>'"&]|(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i;

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'");
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate and sanitize user input
 */
export const validateAndSanitizeInput = (input: string): { valid: boolean; sanitized: string } => {
  // Check for SQL injection patterns
  if (INJECTION_REGEX.test(input)) {
    return { valid: false, sanitized: '' };
  }
  
  // Sanitize the input
  const sanitized = sanitizeInput(input);
  return { valid: true, sanitized };
};

/**
 * Rate limiter to prevent abuse
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxRequests: number = 100;
  private readonly windowMs: number = 60000; // 1 minute

  /**
   * Check if a user has exceeded the rate limit
   */
  isRateLimited(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId);
    
    // If no previous requests, set initial count
    if (!userRequests) {
      this.requests.set(userId, { count: 1, resetTime: now + this.windowMs });
      return false;
    }
    
    // Reset count if window has passed
    if (now > userRequests.resetTime) {
      this.requests.set(userId, { count: 1, resetTime: now + this.windowMs });
      return false;
    }
    
    // Check if limit exceeded
    if (userRequests.count >= this.maxRequests) {
      return true;
    }
    
    // Increment count
    this.requests.set(userId, { 
      count: userRequests.count + 1, 
      resetTime: userRequests.resetTime 
    });
    
    return false;
  }
  
  /**
   * Reset rate limit for a user
   */
  reset(userId: string): void {
    this.requests.delete(userId);
  }
}

/**
 * CSRF Token Manager
 */
export class CSRFTokenManager {
  private static tokens: Map<string, string> = new Map();
  
  /**
   * Generate a new CSRF token
   */
  static generateToken(userId: string): string {
    const token = crypto.randomUUID();
    this.tokens.set(userId, token);
    return token;
  }
  
  /**
   * Validate a CSRF token
   */
  static validateToken(userId: string, token: string): boolean {
    const storedToken = this.tokens.get(userId);
    return storedToken === token;
  }
  
  /**
   * Invalidate a CSRF token
   */
  static invalidateToken(userId: string): void {
    this.tokens.delete(userId);
  }
}

/**
 * Input validation for different data types
 */
export const validate = {
  /**
   * Validate UUID format
   */
  uuid(id: string): boolean {
    if (!id) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  },
  
  /**
   * Validate numeric values
   */
  number(value: string | number, min: number = 0, max: number = Infinity): boolean {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num >= min && num <= max;
  },
  
  /**
   * Validate string length
   */
  stringLength(str: string, min: number = 1, max: number = 1000): boolean {
    return str.length >= min && str.length <= max;
  },
  
  /**
   * Validate role
   */
  role(role: string): boolean {
    return Object.values(UserRole).includes(role as UserRole);
  }
};

/**
 * Security headers for API responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
};

/**
 * Session security utilities
 */
export class SessionSecurity {
  /**
   * Generate secure session token
   */
  static generateSessionToken(): string {
    return crypto.randomUUID();
  }
  
  /**
   * Validate session token
   */
  static validateSessionToken(token: string): boolean {
    return typeof token === 'string' && token.length > 20;
  }
  
  /**
   * Hash sensitive data
   */
  static async hashData(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}