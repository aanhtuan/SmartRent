import React from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxCharacters?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, maxCharacters, id, value, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary"
            >
              {label}
              {props.required && <span className="text-status-error ml-1">*</span>}
            </label>
          )}
          {maxCharacters && (
            <span
              className={cn(
                'text-xs',
                charCount > maxCharacters ? 'text-status-error font-medium' : 'text-ink-muted'
              )}
            >
              {charCount} / {maxCharacters}
            </span>
          )}
        </div>
        <textarea
          id={textareaId}
          ref={ref}
          value={value}
          className={cn(
            'w-full min-h-[100px] px-3.5 py-2.5 bg-surface text-ink placeholder:text-ink-muted/70 text-sm border rounded-control transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y',
            'disabled:bg-surface-subtle disabled:text-ink-muted disabled:cursor-not-allowed',
            error
              ? 'border-status-error focus:ring-status-error/20 focus:border-status-error'
              : 'border-border hover:border-ink-muted/40',
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-status-error font-medium mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-ink-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
