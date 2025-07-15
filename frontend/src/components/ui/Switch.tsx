import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, error, size = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-7',
      md: 'h-5 w-9',
      lg: 'h-6 w-11'
    };

    const thumbSizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className={clsx('flex items-start', className)}>
        <div className="flex items-center">
          <label className="relative inline-flex cursor-pointer">
            <input
              ref={ref}
              type="checkbox"
              className="sr-only peer"
              {...props}
            />
            <div className={clsx(
              'relative rounded-full transition-colors duration-200 ease-in-out',
              'peer-focus:ring-2 peer-focus:ring-brand-500 peer-focus:ring-offset-2',
              'peer-checked:bg-brand-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              error ? 'bg-red-300' : 'bg-gray-200',
              sizeClasses[size]
            )}>
              <div className={clsx(
                'absolute left-0.5 top-0.5 bg-white rounded-full transition-transform duration-200 ease-in-out',
                'peer-checked:translate-x-full',
                thumbSizeClasses[size]
              )} />
            </div>
          </label>
        </div>
        
        {(label || description) && (
          <div className="ml-3">
            {label && (
              <label className="text-sm font-medium text-gray-700">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        )}
        
        {error && (
          <p className="error-text mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
