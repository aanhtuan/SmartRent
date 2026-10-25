import React from 'react';
import { cn } from '../../utils/cn';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-container bg-surface/50 my-4',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center text-ink-muted mb-4 shadow-soft">
        {icon || <FolderOpen className="w-7 h-7 text-primary/60" />}
      </div>
      <h4 className="text-base font-semibold text-ink mb-1.5">{title}</h4>
      <p className="text-sm text-ink-secondary max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
