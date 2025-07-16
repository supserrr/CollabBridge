import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 'md',
  readonly = true,
  onChange,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  return (
    <div className={clsx('flex items-center space-x-1', className)}>
      {Array.from({ length: max }, (_, i) => {
        const rating = i + 1;
        const isFilled = rating <= value;
        const isHalfFilled = rating - 0.5 <= value && value < rating;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(rating)}
            disabled={readonly}
            className={clsx(
              'text-yellow-400',
              !readonly && 'hover:text-yellow-500 cursor-pointer',
              readonly && 'cursor-default'
            )}
          >
            {isFilled || isHalfFilled ? (
              <StarIcon className={sizeClasses[size]} />
            ) : (
              <StarOutlineIcon className={sizeClasses[size]} />
            )}
          </button>
        );
      })}
    </div>
  );
};
