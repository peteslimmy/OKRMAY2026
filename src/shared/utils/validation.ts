/**
 * 4CORE OKR Platform - Validation Utilities
 */

import { ALLOWED_DOMAINS } from '../types';

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate email domain is allowed
 */
export const isAllowedEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return ALLOWED_DOMAINS.some(d => domain === d.toLowerCase());
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validate required field
 */
export const isRequired = (value: string | undefined | null): boolean => {
  return value !== undefined && value !== null && value.trim().length > 0;
};

/**
 * Validate minimum length
 */
export const hasMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

/**
 * Validate maximum length
 */
export const hasMaxLength = (value: string, max: number): boolean => {
  return value.length <= max;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number (Nigerian format)
 */
export const isValidNigerianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11 && (cleaned.startsWith('080') || cleaned.startsWith('081') || 
    cleaned.startsWith('090') || cleaned.startsWith('070') || cleaned.startsWith('091'));
};

/**
 * Validate number is positive
 */
export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * Validate number is within range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return !isNaN(value) && value >= min && value <= max;
};

/**
 * Validate date is not in past
 */
export const isFutureDate = (date: string): boolean => {
  return new Date(date) > new Date();
};

/**
 * Validate date is not in future
 */
export const isPastDate = (date: string): boolean => {
  return new Date(date) < new Date();
};

/**
 * Validate quarter format
 */
export const isValidQuarter = (quarter: string): boolean => {
  return ['Q1', 'Q2', 'Q3', 'Q4'].includes(quarter.toUpperCase());
};

/**
 * Validate year format
 */
export const isValidYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year >= 2020 && year <= currentYear + 5;
};

/**
 * Validate percentage
 */
export const isValidPercentage = (value: number): boolean => {
  return !isNaN(value) && value >= 0 && value <= 100;
};

/**
 * Form validation error type
 */
export type ValidationError = {
  field: string;
  message: string;
};

/**
 * Validate form fields
 */
export const validateForm = (
  data: Record<string, unknown>,
  rules: Record<string, ((value: unknown) => string | null)[]>
): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors.push({ field, message: error });
        break;
      }
    }
  }
  
  return errors;
};

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (fieldName: string) => (value: unknown) => 
    isRequired(value as string) ? null : `${fieldName} is required`,
  
  email: () => (value: unknown) => 
    !value || isValidEmail(value as string) ? null : 'Invalid email format',
  
  minLength: (min: number, fieldName: string) => (value: unknown) =>
    !value || hasMinLength(value as string, min) ? null : `${fieldName} must be at least ${min} characters`,
  
  maxLength: (max: number, fieldName: string) => (value: unknown) =>
    !value || hasMaxLength(value as string, max) ? null : `${fieldName} must be at most ${max} characters`,
  
  positiveNumber: (fieldName: string) => (value: unknown) =>
    !value || isPositiveNumber(Number(value)) ? null : `${fieldName} must be a positive number`,
  
  percentage: (fieldName: string) => (value: unknown) =>
    !value || isValidPercentage(Number(value)) ? null : `${fieldName} must be between 0 and 100`
};