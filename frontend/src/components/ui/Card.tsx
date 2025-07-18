import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div className={cn('card', className)}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return (
    <div className={cn('card-header', className)}>
      {children}
    </div>
  );
};

const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return (
    <div className={cn('card-content', className)}>
      {children}
    </div>
  );
};

const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => {
  return (
    <div className={cn('card-footer', className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };
