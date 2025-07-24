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
    <div className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4 ${className}`}>
      {programs.map((program) => (
        <motion.div
          key={program.program_id}
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => onProgramSelect(program)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Program Image */}
          <div className={`relative w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 ${
            selectedProgram?.program_id === program.program_id
              ? 'ring-2 ring-blue-500 ring-offset-2'
              : 'group-hover:shadow-lg'
          }`}>
            {program.program_thumbnail_url ? (
              <img
                src={program.program_thumbnail_url}
                alt={`${program.program_name} thumbnail`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center rounded-2xl">
                        <span class="text-2xl text-white">🎓</span>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center rounded-2xl">
                <span className="text-2xl text-white">🎓</span>
              </div>
            )}
            
            {/* Selection Indicator */}
            {selectedProgram?.program_id === program.program_id && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
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
          
          {/* Program Name */}
          <div className="mt-2 text-center px-1">
            <span className={`text-sm font-regular leading-tight transition-colors duration-300 ${
              selectedProgram?.program_id === program.program_id
                ? 'text-blue-700'
                : 'text-gray-700 group-hover:text-gray-900'
            }`}>
              {program.program_name}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ProgramGrid;
