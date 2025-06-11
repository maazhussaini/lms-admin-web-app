import React from 'react';
import Button from '@/components/common/Button';

export interface PaginationProps {
  /**
   * Current page number (1-based)
   */
  currentPage: number;
  
  /**
   * Total number of pages
   */
  totalPages: number;
  
  /**
   * Total number of items across all pages
   */
  totalItems?: number;
  
  /**
   * Items per page
   */
  pageSize?: number;
  
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  
  /**
   * Show first and last page buttons
   * @default true
   */
  showFirstLastButtons?: boolean;
  
  /**
   * Maximum number of page buttons to show
   * @default 5
   */
  maxPageButtons?: number;
  
  /**
   * Whether to show the total items counter
   * @default true
   */
  showTotalItems?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Pagination component for navigating between pages of data
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  showFirstLastButtons = true,
  maxPageButtons = 5,
  showTotalItems = true,
  className = '',
}) => {
  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) return null;
  
  // Calculate the range of page buttons to show
  const getPageRange = () => {
    // Calculate half of the max buttons to distribute around current page
    const halfMax = Math.floor(maxPageButtons / 2);
    
    let startPage = Math.max(1, currentPage - halfMax);
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  const pageRange = getPageRange();
  
  // Calculate the range of items being displayed (e.g., "1-10 of 100")
  const getItemsRange = () => {
    if (!totalItems || !pageSize) return '';
    
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);
    
    return `${start}-${end} of ${totalItems}`;
  };
  
  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${className}`}>
      {/* Items range info */}
      {showTotalItems && totalItems && pageSize && (
        <div className="text-sm text-neutral-500 order-2 sm:order-1">
          Showing {getItemsRange()}
        </div>
      )}
      
      {/* Pagination buttons */}
      <div className="flex items-center space-x-1 order-1 sm:order-2">
        {/* First page button */}
        {showFirstLastButtons && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="px-3"
            aria-label="First page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </Button>
        )}
        
        {/* Previous page button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3"
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        
        {/* Page number buttons */}
        {pageRange[0] > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(1)}
              className="hidden sm:flex px-3"
            >
              1
            </Button>
            {pageRange[0] > 2 && (
              <span className="px-2 text-neutral-400">...</span>
            )}
          </>
        )}
        
        {pageRange.map(page => (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(page)}
            className="px-3"
          >
            {page}
          </Button>
        ))}
        
        {pageRange[pageRange.length - 1] < totalPages && (
          <>
            {pageRange[pageRange.length - 1] < totalPages - 1 && (
              <span className="px-2 text-neutral-400">...</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              className="hidden sm:flex px-3"
            >
              {totalPages}
            </Button>
          </>
        )}
        
        {/* Next page button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3"
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
        
        {/* Last page button */}
        {showFirstLastButtons && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3"
            aria-label="Last page"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Pagination;