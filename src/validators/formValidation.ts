/**
 * 4CORE Form Validation System
 * Standardized validation patterns for all forms across the application
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface FieldConfig {
  name: string;
  label: string;
  rules: ValidationRule;
}

/**
 * Validate a single field value against rules
 */
export const validateField = (value: string, rules: ValidationRule): string | null => {
  const trimmedValue = value.trim();

  // Required check
  if (rules.required && !trimmedValue) {
    return 'This field is required';
  }

  // Skip other validations if empty and not required
  if (!trimmedValue) {
    return null;
  }

  // Min length check
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  // Max length check
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return 'Invalid format';
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(trimmedValue);
  }

  return null;
};

/**
 * Validate an entire form object
 */
export const validateForm = (
  formData: Record<string, string>,
  fieldConfigs: FieldConfig[]
): ValidationResult => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  let isValid = true;

  fieldConfigs.forEach(config => {
    const value = formData[config.name] || '';
    const error = validateField(value, config.rules);

    if (error) {
      errors[config.name] = error;
      isValid = false;
    }
  });

  return { isValid, errors, warnings };
};

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s-()]{10,}$/,
  url: /^https?:\/\/.+/,
  number: /^\d+$/,
  decimal: /^\d*\.?\d+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  slug: /^[a-z0-9-]+$/,
};

/**
 * Common validation rules
 */
export const CommonRules = {
  required: { required: true },
  email: {
    required: true,
    pattern: ValidationPatterns.email,
    custom: (value: string) => {
      if (value.length > 254) return 'Email address too long';
      return null;
    },
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
      if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter';
      if (!/[0-9]/.test(value)) return 'Must contain at least one number';
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Must contain at least one special character';
      return null;
    },
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value: string) => {
      if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      return null;
    },
  },
  title: {
    required: true,
    minLength: 5,
    maxLength: 200,
  },
  description: {
    required: false,
    maxLength: 2000,
  },
  percentage: {
    required: true,
    pattern: /^100$|^(\d{1,2})$/,
    custom: (value: string) => {
      const num = parseInt(value, 10);
      if (num < 0 || num > 100) return 'Must be between 0 and 100';
      return null;
    },
  },
  amount: {
    required: true,
    pattern: ValidationPatterns.decimal,
    custom: (value: string) => {
      const num = parseFloat(value);
      if (num < 0) return 'Must be a positive number';
      return null;
    },
  },
};

/**
 * Real-time validation hook for forms
 */
export const useFieldValidation = (
  value: string,
  rules: ValidationRule,
  touched: boolean = false
): { error: string | null; isValid: boolean } => {
  const error = touched ? validateField(value, rules) : null;
  return { error, isValid: !error };
};

/**
 * Form field configuration builder
 */
export const buildFieldConfig = (
  name: string,
  label: string,
  rules: ValidationRule
): FieldConfig => ({ name, label, rules });

/**
 * Get validation error message for a field
 */
export const getErrorMessage = (
  errors: Record<string, string>,
  fieldName: string
): string | null => {
  return errors[fieldName] || null;
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.values(errors).some(error => error !== null && error !== '');
};

/**
 * Get first error in form
 */
export const getFirstError = (errors: Record<string, string>): string | null => {
  const firstError = Object.values(errors).find(error => error !== null && error !== '');
  return firstError || null;
};
