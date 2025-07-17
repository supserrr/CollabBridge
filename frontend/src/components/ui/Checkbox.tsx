import React from 'react';
import { cn } from '@/utils/helpers';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex items-start space-x-3">
      <input
        type="checkbox"
        className={cn(
          'mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {label && (
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Checkbox;
