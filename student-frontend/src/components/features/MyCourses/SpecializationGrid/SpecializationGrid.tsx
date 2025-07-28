import { ItemGrid } from '@/components/common/ItemGrid';
import { GRID_LAYOUTS, ITEM_GRID_COLORS } from '@/constants/courseUI.constants';
import type { Specialization } from '@/services';
import type { ItemConfig, EmptyStateConfig } from '@/components/common/ItemGrid';

export interface SpecializationGridProps {
  /**
   * Array of specializations to display
   */
  specializations: Specialization[];
  
  /**
   * Currently selected specialization
   */
  selectedSpecialization?: Specialization | null;
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Specialization selection handler
   */
  onSpecializationSelect: (specialization: Specialization) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Configuration for Specialization items
const specializationConfig: ItemConfig<Specialization> = {
  getId: (specialization) => specialization.specialization_id,
  getName: (specialization) => specialization.specialization_name,
  getThumbnailUrl: (specialization) => specialization.specialization_thumbnail_url,
};

// Empty state configuration
const emptyState: EmptyStateConfig = {
  title: 'No specializations available',
  message: "This program doesn't have any specializations yet",
};

/**
 * SpecializationGrid - Displays specializations with thumbnail images in a grid layout
 * 
 * Security: Only displays specializations that belong to the selected program
 * and that the authenticated user has access to.
 * Uses the generic ItemGrid component with specialization-specific configuration.
 */
const SpecializationGrid: React.FC<SpecializationGridProps> = ({
  specializations,
  selectedSpecialization,
  loading = false,
  onSpecializationSelect,
  className = ''
}) => {
  return (
    <ItemGrid
      items={specializations}
      selectedItem={selectedSpecialization}
      loading={loading}
      onItemSelect={onSpecializationSelect}
      itemConfig={specializationConfig}
      gridLayout={GRID_LAYOUTS.SPECIALIZATIONS}
      colorScheme={ITEM_GRID_COLORS.SPECIALIZATION}
      emptyState={emptyState}
      className={className}
    />
  );
};

export default SpecializationGrid;
