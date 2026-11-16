import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'inactive' | 'primary' | 'accent';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'info',
  size = 'md',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    success: 'bg-status-success-soft text-status-success border-status-success-border',
    warning: 'bg-status-warning-soft text-status-warning border-status-warning-border',
    error: 'bg-status-error-soft text-status-error border-status-error-border',
    info: 'bg-status-info-soft text-status-info border-status-info-border',
    inactive: 'bg-status-inactive-soft text-status-inactive border-status-inactive-border',
    primary: 'bg-primary-soft text-primary-active border-primary/20',
    accent: 'bg-accent-soft text-accent border-accent/20',
  };

  const dotColors = {
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
    info: 'bg-status-info',
    inactive: 'bg-status-inactive',
    primary: 'bg-primary',
    accent: 'bg-accent',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border shadow-none leading-none select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
};
