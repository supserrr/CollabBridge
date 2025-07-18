import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import type { InputProps } from '../../types';

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, placeholder, type = 'text', error, required, disabled, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
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
        />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
