import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ 
  variant = 'default', 
  className, 
  children 
}) => {
  return (
    <span
      className={cn(
        'badge',
        {
          'badge-default': variant === 'default',
          'badge-secondary': variant === 'secondary',
          'badge-destructive': variant === 'destructive',
          'badge-outline': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
