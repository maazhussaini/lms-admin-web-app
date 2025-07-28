import { ItemGrid } from '@/components/common/ItemGrid';
import { GRID_LAYOUTS, ITEM_GRID_COLORS } from '@/constants/courseUI.constants';
import type { Program } from '@/services';
import type { ItemConfig, EmptyStateConfig } from '@/components/common/ItemGrid';

export interface ProgramGridProps {
  /**
   * Array of programs to display
   */
  programs: Program[];
  
  /**
   * Currently selected program
   */
  selectedProgram?: Program | null;
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Program selection handler
   */
  onProgramSelect: (program: Program) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

// Configuration for Program items
const programConfig: ItemConfig<Program> = {
  getId: (program) => program.program_id,
  getName: (program) => program.program_name,
  getThumbnailUrl: (program) => program.program_thumbnail_url,
};

// Empty state configuration
const emptyState: EmptyStateConfig = {
  title: 'No programs available',
  message: 'Check back later for new programs',
};

/**
 * ProgramGrid - Displays programs with thumbnail images in a grid layout
 * 
 * Security: Only displays programs that the authenticated user has access to.
 * Uses the generic ItemGrid component with program-specific configuration.
 */
const ProgramGrid: React.FC<ProgramGridProps> = ({
  programs,
  selectedProgram,
  loading = false,
  onProgramSelect,
  className = ''
}) => {
  return (
    <ItemGrid
      items={programs}
      selectedItem={selectedProgram}
      loading={loading}
      onItemSelect={onProgramSelect}
      itemConfig={programConfig}
      gridLayout={GRID_LAYOUTS.PROGRAMS}
      colorScheme={ITEM_GRID_COLORS.PROGRAM}
      emptyState={emptyState}
      className={className}
    />
  );
};

export default ProgramGrid;
