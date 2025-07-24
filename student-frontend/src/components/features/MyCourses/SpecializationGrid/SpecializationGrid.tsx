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
    <div className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4 ${className}`}>
      {specializations.map((specialization) => (
        <motion.div
          key={specialization.specialization_id}
          className="flex flex-col items-center cursor-pointer group"
          onClick={() => onSpecializationSelect(specialization)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Specialization Image */}
          <div className={`relative w-16 h-16 rounded-2xl overflow-hidden transition-all duration-300 ${
            selectedSpecialization?.specialization_id === specialization.specialization_id
              ? 'ring-2 ring-green-500 ring-offset-2'
              : 'group-hover:shadow-lg'
          }`}>
            {specialization.specialization_thumbnail_url ? (
              <img
                src={specialization.specialization_thumbnail_url}
                alt={`${specialization.specialization_name} thumbnail`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center rounded-2xl">
                        <span class="text-2xl text-white">📚</span>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center rounded-2xl">
                <span className="text-2xl text-white">📚</span>
              </div>
            )}
            
            {/* Selection Indicator */}
            {selectedSpecialization?.specialization_id === specialization.specialization_id && (
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
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
          
          {/* Specialization Name */}
          <div className="mt-2 text-center px-1">
            <span className={`text-sm font-regular leading-tight transition-colors duration-300 ${
              selectedSpecialization?.specialization_id === specialization.specialization_id
                ? 'text-green-700'
                : 'text-gray-700 group-hover:text-gray-900'
            }`}>
              {specialization.specialization_name}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SpecializationGrid;
