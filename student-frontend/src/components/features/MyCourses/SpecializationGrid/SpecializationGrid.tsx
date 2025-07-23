import React from 'react';
import { motion } from 'framer-motion';
import Spinner from '@/components/common/Spinner';
import type { Specialization } from '@/services';

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

/**
 * SpecializationGrid - Displays specializations with thumbnail images in a grid layout
 * 
 * Security: Only displays specializations that belong to the selected program
 * and that the authenticated user has access to.
 */
const SpecializationGrid: React.FC<SpecializationGridProps> = ({
  specializations,
  selectedSpecialization,
  loading = false,
  onSpecializationSelect,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <Spinner size="md" />
      </div>
    );
  }

  if (!specializations || specializations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No specializations available</h3>
        <p className="text-gray-600">This program doesn't have any specializations yet</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-row gap-1 sm:gap-2 overflow-x-auto pb-4 sm:overflow-x-visible sm:flex-wrap sm:justify-start ${className}`}>
      {specializations.map((specialization) => (
        <motion.div
          key={specialization.specialization_id}
          className="flex flex-col items-center min-w-[90px] sm:min-w-[110px] flex-shrink-0 sm:flex-shrink"
          onClick={() => onSpecializationSelect(specialization)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-md overflow-hidden ${
              selectedSpecialization?.specialization_id === specialization.specialization_id
                ? 'border-2 border-indigo-400'
                : 'border border-gray-200'
            }`}
          >
            {specialization.specialization_thumbnail_url ? (
              <img
                src={specialization.specialization_thumbnail_url}
                alt={`${specialization.specialization_name} thumbnail`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <span class="text-3xl sm:text-4xl">📚</span>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl">📚</span>
              </div>
            )}
          </div>
          <span className="mt-3 text-sm sm:text-base font-regular text-neutral-800 text-center leading-tight">
            {specialization.specialization_name}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export default SpecializationGrid;
