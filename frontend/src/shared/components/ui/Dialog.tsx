import React, { useEffect } from 'react';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-surface border border-border rounded-container shadow-modal p-6 sm:p-7 z-10 my-8 transition-all',
          'animate-in fade-in-0 zoom-in-95 duration-150',
          maxWidths[maxWidth],
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1 rounded-control text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <div className="mb-5 pr-6">
            <h2 className="text-xl font-semibold text-ink tracking-tight">{title}</h2>
            {description && <p className="text-sm text-ink-secondary mt-1">{description}</p>}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
};
