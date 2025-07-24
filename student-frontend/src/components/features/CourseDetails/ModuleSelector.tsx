import React, { useMemo } from 'react';
import { ItemSelector } from '@/components/common/ItemSelector';
import { moduleToSelectorItem, parseModuleStats } from '@/utils/courseDetailsUtils';
import { CourseModule } from '@/services/courseService';

export interface ModuleSelectorProps {
  /** List of course modules */
  modules: CourseModule[];
  /** Currently active module ID */
  currentModuleId: number;
  /** Handler for module selection */
  onModuleSelect: (moduleId: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ModuleSelector - Interactive horizontal selector for navigating between course modules
 * 
 * Features:
 * - Horizontal scrollable list of modules with drag-to-scroll
 * - Current module highlighting with smooth animations
 * - Smart click vs drag detection
 * - Module information display (number, name, topic count)
 * - Responsive design with touch-friendly interactions
 * - Hover effects with proper container constraints
 * 
 * Security: This component assumes parent has proper authentication guards
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  modules,
  currentModuleId,
  onModuleSelect,
  className
}) => {
  // Transform modules to selector items
  const selectorItems = useMemo(() => {
    return modules.map((module, index) => {
      const { topicCount, videoCount } = parseModuleStats(module.module_stats || '');
      
      return moduleToSelectorItem({
        ...module,
        topicCount,
        videoCount,
        displayNumber: index + 1,
      });
    });
  }, [modules]);

  return (
    <ItemSelector
      items={selectorItems}
      currentItemId={currentModuleId}
      onItemSelect={onModuleSelect}
      className={className}
      ariaLabel="Select module"
      showCounts={true}
      showSubtitles={true}
    />
  );
};

export default ModuleSelector;
