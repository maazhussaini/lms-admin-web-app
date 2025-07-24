import React, { useMemo } from 'react';
import { ItemSelector } from '@/components/common/ItemSelector';
import { CourseModule } from '@/services/courseService';
import { parseModuleStats } from '@/utils/courseDetailsUtils';

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
 * - Business-approved white container with shadow design
 * - Header with "Course Modules" title and module counter
 * - Custom drag-to-scroll implementation
 * - Active module highlighting with blue color scheme
 * - Responsive design with minimum item widths
 * - Smooth animations with Framer Motion
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
  // Transform modules to items for the new ItemSelector
  const items = useMemo(() => {
    return modules.map((module, index) => {
      const { topicCount, videoCount } = parseModuleStats(module.module_stats || '');
      
      return {
        id: module.course_module_id.toString(),
        title: `Module ${index + 1}`,
        subtitle: module.course_module_name,
        description: `${videoCount} Video Lectures`,
        count: topicCount,
        countLabel: 'Topics',
      };
    });
  }, [modules]);

  // Find current module index for display
  const currentIndex = useMemo(() => {
    const index = modules.findIndex(module => module.course_module_id === currentModuleId);
    return index !== -1 ? index + 1 : 1;
  }, [modules, currentModuleId]);

  // Handle module selection - convert string ID back to number
  const handleModuleSelect = (item: { id: string; title: string; description?: string }) => {
    const moduleId = parseInt(item.id, 10);
    onModuleSelect(moduleId);
  };

  return (
    <ItemSelector
      items={items}
      selectedItemId={currentModuleId.toString()}
      onItemSelect={handleModuleSelect}
      title="Course Modules"
      totalCount={modules.length}
      currentIndex={currentIndex}
      className={className}
    />
  );
};

export default ModuleSelector;
