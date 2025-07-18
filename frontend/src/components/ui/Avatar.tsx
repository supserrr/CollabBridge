import React from 'react';
import { cn, generateInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  firstName?: string;
  lastName?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  firstName,
  lastName,
  className,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const initials = firstName && lastName ? generateInitials(firstName, lastName) : '';

  if (src) {
    return (
      <img
        src={src}
        alt={alt || `${firstName} ${lastName}` || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-medium text-white',
        sizeClasses[size],
        className
      )}
    >
      {initials || '?'}
    </div>
  );
};

export default Avatar;
