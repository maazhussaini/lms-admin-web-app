/**
 * @file components/common/ItemGrid/ItemGrid.tsx
 * @description Generic grid component for displaying selectable items with thumbnails
 * Replaces ProgramGrid and SpecializationGrid with unified implementation
 */

import { motion } from 'framer-motion';
import clsx from 'clsx';
import Spinner from '@/components/common/Spinner';

/**
 * Configuration for item rendering
 */
export interface ItemConfig<T> {
  /** Extract unique identifier from item */
  getId: (item: T) => string | number;
  /** Extract display name from item */
  getName: (item: T) => string;
  /** Extract thumbnail URL from item (optional) */
  getThumbnailUrl?: (item: T) => string | null | undefined;
}

/**
 * Color scheme configuration
 */
export interface ColorScheme {
  /** Ring color for selection (e.g., 'ring-blue-500') */
  ring: string;
  /** Gradient colors (e.g., 'from-blue-400 to-blue-600') */
  gradient: string;
  /** Selection indicator background (e.g., 'bg-blue-500') */
  selection: string;
  /** Selected text color (e.g., 'text-blue-700') */
  text: string;
  /** Fallback emoji when no thumbnail */
  fallbackEmoji: string;
}

/**
 * Empty state configuration
 */
export interface EmptyStateConfig {
  /** Title for empty state */
  title: string;
  /** Message for empty state */
  message: string;
}

export interface ItemGridProps<T> {
  /** Array of items to display */
  items: T[];
  /** Currently selected item */
  selectedItem?: T | null;
  /** Loading state */
  loading?: boolean;
  /** Item selection handler */
  onItemSelect: (item: T) => void;
  /** Configuration for extracting item properties */
  itemConfig: ItemConfig<T>;
  /** Grid layout CSS classes */
  gridLayout: string;
  /** Color scheme for the grid */
  colorScheme: ColorScheme;
  /** Empty state configuration */
  emptyState: EmptyStateConfig;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ItemGrid - Generic grid component for displaying selectable items
 * 
 * Features:
 * - Configurable item extraction functions
 * - Customizable color schemes
 * - Smooth animations with Framer Motion
 * - Responsive grid layouts
 * - Loading and empty states
 * - Fallback handling for missing thumbnails
 * 
 * Security: Only displays items provided by parent component.
 * Parent is responsible for filtering based on user permissions.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
function ItemGrid<T>({
  items,
  selectedItem,
  loading = false,
  onItemSelect,
  itemConfig,
  gridLayout,
  colorScheme,
  emptyState,
  className = ''
}: ItemGridProps<T>) {
  const { getId, getName, getThumbnailUrl } = itemConfig;

  if (loading) {
    return (
      <div className={clsx('flex justify-center py-8', className)}>
        <Spinner size="md" />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyState.title}</h3>
        <p className="text-gray-600">{emptyState.message}</p>
      </div>
    );
  }

  return (
    <div className={clsx('grid', gridLayout, className)}>
      {items.map((item) => {
        const itemId = String(getId(item)); // Convert to string for React key
        const itemName = getName(item);
        const thumbnailUrl = getThumbnailUrl?.(item) || undefined; // Convert null to undefined
        const isSelected = selectedItem ? String(getId(selectedItem)) === itemId : false;

        return (
          <motion.div
            key={itemId}
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => onItemSelect(item)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Item Image */}
            <div className={clsx(
              'relative w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300',
              {
                [`ring-2 ${colorScheme.ring} ring-offset-2`]: isSelected,
                'group-hover:shadow-lg': !isSelected,
              }
            )}>
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={`${itemName} thumbnail`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center rounded-2xl">
                          <span class="text-2xl text-white">${colorScheme.fallbackEmoji}</span>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className={clsx(
                  'w-full h-full bg-gradient-to-br flex items-center justify-center rounded-2xl',
                  colorScheme.gradient
                )}>
                  <span className="text-2xl text-white">{colorScheme.fallbackEmoji}</span>
                </div>
              )}
              
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  className={clsx(
                    'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg',
                    colorScheme.selection
                  )}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </div>
            
            {/* Item Name */}
            <div className="mt-2 text-center px-1">
              <span className={clsx(
                'text-sm font-regular leading-tight transition-colors duration-300',
                {
                  [colorScheme.text]: isSelected,
                  'text-gray-700 group-hover:text-gray-900': !isSelected,
                }
              )}>
                {itemName}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Export with generic type support
export { ItemGrid };
export default ItemGrid;
