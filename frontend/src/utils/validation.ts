import { validateEmail, validatePassword } from './auth';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Generic form validator
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    // Check required
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${formatFieldName(field)} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') return;
    
    // Check min length
    if (rule.minLength && value.toString().length < rule.minLength) {
      errors[field] = `${formatFieldName(field)} must be at least ${rule.minLength} characters`;
      return;
    }
    
    // Check max length
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      errors[field] = `${formatFieldName(field)} must be no more than ${rule.maxLength} characters`;
      return;
    }
    
    // Check pattern
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      errors[field] = `${formatFieldName(field)} format is invalid`;
      return;
    }
    
    // Check custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });
  
  return errors;
};

// Specific validation functions
export const validateLoginForm = (data: { email: string; password: string }): ValidationErrors => {
  return validateForm(data, {
    email: {
      required: true,
      custom: (value) => validateEmail(value) ? null : 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8
    }
  });
};

export const validateRegisterForm = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}): ValidationErrors => {
  const errors = validateForm(data, {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      custom: (value) => validateEmail(value) ? null : 'Please enter a valid email address'
    },
    password: {
      required: true,
      custom: (value) => {
        const passwordErrors = validatePassword(value);
        return passwordErrors.length > 0 ? passwordErrors[0] : null;
      }
    },
    confirmPassword: {
      required: true,
      custom: (value) => value === data.password ? null : 'Passwords do not match'
    },
    terms: {
      required: true,
      custom: (value) => value === true ? null : 'You must accept the terms and conditions'
    }
  });
  
  return errors;
};

export const validateEventForm = (data: {
  title: string;
  description: string;
  eventType: string;
  date: string;
  location: string;
  requiredRoles: string[];
}): ValidationErrors => {
  return validateForm(data, {
    title: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 1000
    },
    eventType: {
      required: true
    },
    date: {
      required: true,
      custom: (value) => {
        const eventDate = new Date(value);
        const now = new Date();
        return eventDate > now ? null : 'Event date must be in the future';
      }
    },
    location: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    requiredRoles: {
      custom: (value) => Array.isArray(value) && value.length > 0 ? null : 'At least one role is required'
    }
  });
};

// Utility function to format field names
const formatFieldName = (field: string): string => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

// File validation
export const validateFile = (
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}
): string | null => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;
  
  if (file.size > maxSize) {
    return `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
  }
  
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }
  
  return null;
};

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
