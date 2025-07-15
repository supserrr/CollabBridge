import React from 'react';
import { clsx } from 'clsx';

interface FormFieldProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required,
  children,
  className
}) => {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
      
      {error && (
        <p className="error-text">{error}</p>
      )}
    </div>
  );
};
