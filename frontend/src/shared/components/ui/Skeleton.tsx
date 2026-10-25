import React from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}) => {
  const variants = {
    text: 'h-4 rounded-control',
    rectangular: 'rounded-card',
    circular: 'rounded-full',
  };

  return (
    <div
      className={cn('animate-pulse bg-surface-subtle border border-border/40', variants[variant], className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};
