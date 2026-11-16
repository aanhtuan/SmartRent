import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  className,
}) => {
  const hasNextPage = totalItems === pageSize;
  const hasPrevPage = currentPage > 1;

  if (currentPage === 1 && !hasNextPage) return null;

  return (
    <div className={`flex items-center justify-between pt-4 border-t border-border mt-4 ${className || ''}`}>
      <span className="text-xs text-ink-secondary">
        Trang <strong className="font-semibold text-ink">{currentPage}</strong> ({totalItems} mục trên trang này)
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          Trang trước
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          Trang sau
        </Button>
      </div>
    </div>
  );
};
