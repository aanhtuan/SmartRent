import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Đã có lỗi xảy ra',
  message = 'Không thể tải dữ liệu từ máy chủ. Vui lòng kiểm tra lại kết nối và thử lại.',
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-10 border border-status-error-border rounded-container bg-status-error-soft/30 my-4',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-status-error-soft text-status-error flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-ink mb-1">{title}</h4>
      <p className="text-sm text-ink-secondary max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          Thử lại
        </Button>
      )}
    </div>
  );
};
