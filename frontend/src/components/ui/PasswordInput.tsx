import React, { forwardRef, useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  showStrengthIndicator?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, showStrengthIndicator = false, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
      if (!password) return { score: 0, label: '', color: 'bg-gray-200' };
      
      let score = 0;
      if (password.length >= 8) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/\d/.test(password)) score++;
      if (/[^a-zA-Z\d]/.test(password)) score++;

      const strengthMap = {
        0: { label: 'Very Weak', color: 'bg-red-500' },
        1: { label: 'Weak', color: 'bg-red-400' },
        2: { label: 'Fair', color: 'bg-yellow-500' },
        3: { label: 'Good', color: 'bg-blue-500' },
        4: { label: 'Strong', color: 'bg-green-500' },
        5: { label: 'Very Strong', color: 'bg-green-600' },
      };

      return { score, ...strengthMap[score as keyof typeof strengthMap] };
    };

    const strength = showStrengthIndicator && value ? getPasswordStrength(value as string) : null;

    return (
      <div className="w-full">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          label={label}
          error={error}
          hint={hint}
          value={value}
          {...props}
          icon={
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.758 7.758M12 12l2.122-2.122m-2.122 2.122L7.758 7.758m4.242 4.242L15.314 15.314M12 12l2.878 2.878" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </Button>
          }
        />

        {strength && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Password strength</span>
              <span className={`text-xs font-medium ${
                strength.score >= 4 ? 'text-green-600' : 
                strength.score >= 3 ? 'text-blue-600' : 
                strength.score >= 2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {strength.label}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
