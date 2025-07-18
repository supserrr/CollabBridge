import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import type { SelectProps } from '../../types';

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, placeholder, options, error, required, disabled, className, value, onChange, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            'input',
            {
              'border-destructive focus:border-destructive focus:ring-destructive': error,
              'opacity-50 cursor-not-allowed': disabled,
            },
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
