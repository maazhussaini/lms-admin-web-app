import { type ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  sortable?: boolean;
  id?: string; // Unique identifier for the column, useful for sorting
}

export interface TableProps<T> {
  /**
   * Data to be displayed in the table
   */
  data: T[];
  
  /**
   * Column definitions for the table
   */
  columns: Column<T>[];
  
  /**
   * Key extractor function to get a unique key for each row
   */
  keyExtractor: (item: T) => string;
  
  /**
   * Whether the table is in a loading state
   */
  isLoading?: boolean;
  
  /**
   * Number of skeleton rows to show when loading
   */
  skeletonRowCount?: number;
  
  /**
   * Additional CSS classes for the table container
   */
  className?: string;
  
  /**
   * Additional CSS classes for the table element
   */
  tableClassName?: string;
  
  /**
   * Whether to include hover effect on rows
   */
  hoverEffect?: boolean;
  
  /**
   * Whether to add striped rows
   */
  striped?: boolean;
  
  /**
   * Current sort column id or key
   */
  sortColumn?: string;
  
  /**
   * Current sort direction
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * Handler for sort change
   */
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
}

/**
 * Reusable Table component for displaying data in rows and columns
 */
function Table<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  skeletonRowCount = 5,
  className = '',
  tableClassName = '',
  hoverEffect = true,
  striped = true,
  sortColumn,
  sortDirection,
  onSort,
}: TableProps<T>) {
  // Function to render cell content based on accessor
  const renderCell = (item: T, accessor: Column<T>['accessor']) => {
    if (typeof accessor === 'function') {
      return accessor(item);
    }
    
    return item[accessor] as ReactNode;
  };
  
  // Skeleton rows for loading state
  const renderSkeletonRows = () => {
    return Array(skeletonRowCount)
      .fill(0)
      .map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className="animate-pulse">
          {columns.map((column, colIndex) => (
            <td
              key={`skeleton-cell-${rowIndex}-${colIndex}`}
              className={`py-4 px-6 ${column.className || ''}`}
            >
              <div className="h-5 bg-neutral-200 rounded-md" />
            </td>
          ))}
        </tr>
      ));
  };
  
  return (
    <div className={`w-full overflow-hidden rounded-lg border border-neutral-200 shadow-sm ${className}`}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-neutral-200 ${tableClassName}`}>
          <thead className="bg-neutral-50">
            <tr className="divide-x divide-neutral-200">
              {columns.map((column, index) => {
                const columnId = column.id || (typeof column.accessor === 'string' ? column.accessor.toString() : `col-${index}`);
                const isSorted = sortColumn === columnId;
                const isSortable = column.sortable && onSort;
                
                return (
                  <th
                    key={`header-${index}`}
                    className={`py-3.5 px-6 text-xs font-semibold text-neutral-700 uppercase tracking-wider whitespace-nowrap bg-neutral-50/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-50/70 ${
                      column.className?.includes('text-right') ? 'text-right' : 'text-left'
                    } ${column.className || ''} ${isSortable ? 'cursor-pointer hover:bg-neutral-100' : ''}`}
                    onClick={isSortable ? () => {
                      const newDirection = isSorted && sortDirection === 'asc' ? 'desc' : 'asc';
                      onSort(columnId, newDirection);
                    } : undefined}
                    aria-sort={isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                  >
                    <div className={`flex items-center ${
                      column.className?.includes('text-right') ? 'justify-end' : 'justify-start'
                    } min-h-[20px]`}>
                      <span>{column.header}</span>
                      {isSortable && (
                        <span className="ml-1.5 flex-shrink-0">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )
                          ) : (
                            <svg className="w-3.5 h-3.5 text-neutral-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-neutral-200">
            {isLoading
              ? renderSkeletonRows()
              : data.map((item) => (
                  <tr
                    key={keyExtractor(item)}
                    className={`
                      ${hoverEffect ? 'hover:bg-neutral-50 transition-colors duration-150' : ''}
                      ${striped ? 'odd:bg-white even:bg-neutral-50/30' : ''}
                    `}
                  >
                    {columns.map((column, cellIndex) => (
                      <td
                        key={`cell-${keyExtractor(item)}-${cellIndex}`}
                        className={`py-4 px-6 text-sm text-neutral-800 ${column.className || ''}`}
                      >
                        {renderCell(item, column.accessor)}
                      </td>
                    ))}
                  </tr>
                ))}
                
            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 px-6 text-center text-neutral-500"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <svg className="w-10 h-10 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-base">No data available</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;