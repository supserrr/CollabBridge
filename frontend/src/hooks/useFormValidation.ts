import { useState, useCallback } from 'react';
import { ValidationErrors, validateForm, ValidationRule } from '@/utils/validation';

export const useFormValidation = <T extends Record<string, any>>(
  rules: Record<keyof T, ValidationRule>
) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback((data: T): boolean => {
    setIsValidating(true);
    
    const validationErrors = validateForm(data, rules);
    setErrors(validationErrors);
    
    setIsValidating(false);
    return Object.keys(validationErrors).length === 0;
  }, [rules]);

  const validateField = useCallback((fieldName: keyof T, value: any): boolean => {
    const fieldRule = rules[fieldName];
    if (!fieldRule) return true;

    const fieldErrors = validateForm({ [fieldName]: value } as T, { [fieldName]: fieldRule });
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors[fieldName as string]
    }));

    return !fieldErrors[fieldName as string];
  }, [rules]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName as string];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValidating,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
};
