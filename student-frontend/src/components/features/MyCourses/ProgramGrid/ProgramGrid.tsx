import React from 'react';
import { motion } from 'framer-motion';
import Spinner from '@/components/common/Spinner';
import type { Program } from '@/services';

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

/**
 * ProgramGrid - Displays programs with thumbnail images in a grid layout
 * 
 * Security: Only displays programs that the authenticated user has access to.
 * Extracted from MyCoursesPage for reusability.
 */
const ProgramGrid: React.FC<ProgramGridProps> = ({
  programs,
  selectedProgram,
  loading = false,
  onProgramSelect,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <Spinner size="md" />
      </div>
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No programs available</h3>
        <p className="text-gray-600">Check back later for new programs</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-row gap-1 sm:gap-2 overflow-x-auto pb-4 sm:overflow-x-visible sm:flex-wrap sm:justify-start ${className}`}>
      {programs.map((program) => (
        <motion.div
          key={program.program_id}
          className="flex flex-col items-center min-w-[90px] sm:min-w-[110px] flex-shrink-0 sm:flex-shrink"
          onClick={() => onProgramSelect(program)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-md overflow-hidden ${
              selectedProgram?.program_id === program.program_id
                ? 'border-2 border-indigo-400'
                : 'border border-gray-200'
            }`}
          >
            {program.program_thumbnail_url ? (
              <img
                src={program.program_thumbnail_url}
                alt={`${program.program_name} thumbnail`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span class="text-3xl sm:text-4xl">🎓</span>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl">🎓</span>
              </div>
            )}
          </div>
          <span className="mt-3 text-sm sm:text-base font-regular text-neutral-800 text-center leading-tight">
            {program.program_name}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default ProgramGrid;
