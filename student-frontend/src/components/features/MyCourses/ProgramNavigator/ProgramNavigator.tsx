import React, { useState, useEffect } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { useApiList } from '@/hooks/useApi';
import { apiClient } from '@/api';
import ProgramGrid from '@/components/features/MyCourses/ProgramGrid/ProgramGrid';
import SpecializationGrid from '@/components/features/MyCourses/SpecializationGrid/SpecializationGrid';
import type { Program, Specialization } from '@/services';

export interface FilterBarProps {
  /**
   * Selected program from parent
   */
  selectedProgram?: Program | null;
  
  /**
   * Selected specialization from parent
   */
  selectedSpecialization?: Specialization | null;
  
  /**
   * Program selection handler
   */
  onProgramSelect: (program: Program) => void;
  
  /**
   * Specialization selection handler
   */
  onSpecializationSelect: (specialization: Specialization) => void;
  
  /**
   * Clear program filter handler
   */
  onClearProgram: () => void;
  
  /**
   * Clear specialization filter handler
   */
  onClearSpecialization: () => void;
  
  /**
   * Clear all filters handler
   */
  onClearAllFilters: () => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * FilterBar - Horizontal filter component for Programs and Specializations
 * 
 * This component provides a horizontal filter interface for selecting programs
 * and specializations. It displays selected filters as chips with clear buttons
 * and shows available options as pills for selection.
 * 
 * Security: All data is filtered based on user permissions and tenant context.
 */
const FilterBar: React.FC<FilterBarProps> = ({
  selectedProgram,
  selectedSpecialization,
  onProgramSelect,
  onSpecializationSelect,
  onClearProgram,
  onClearSpecialization,
  onClearAllFilters,
  className = ''
}) => {
  // API call for programs
  const { 
    data: programsData, 
    loading: programsLoading 
  } = useApiList<Program>('/programs/tenant/list', {
    page: 1,
    limit: 50,
    status: 'ACTIVE'
  });

  // Manual API call for specializations to avoid infinite loop in useApiList
  const [specializationsData, setSpecializationsData] = useState<Specialization[]>([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(false);

  useEffect(() => {
    if (!selectedProgram?.program_id) {
      setSpecializationsData([]);
      return;
    }

    const abortController = new AbortController();
    setSpecializationsLoading(true);

    const fetchSpecializations = async () => {
      try {
        const queryParams = new URLSearchParams({
          program_id: selectedProgram.program_id.toString(),
          page: '1',
          limit: '50'
        });

        const response = await apiClient.get<{
          items: Specialization[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNext: boolean;
            hasPrev: boolean;
          };
        }>(`/specializations/by-program?${queryParams}`, {
          signal: abortController.signal
        });

        setSpecializationsData(response.items || []);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching specializations:', error);
          setSpecializationsData([]);
        }
      } finally {
        setSpecializationsLoading(false);
      }
    };

    fetchSpecializations();

    return () => {
      abortController.abort();
    };
  }, [selectedProgram?.program_id]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        {(selectedProgram || selectedSpecialization) && (
          <button
            onClick={onClearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Program Filter Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-medium text-primary-800">Programs</span>
          {selectedProgram && (
            <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {selectedProgram.program_name}
              <button
                onClick={onClearProgram}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                aria-label="Clear program filter"
              >
                <RxCross2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        
        {!selectedProgram && (
          <ProgramGrid
            programs={programsData || []}
            selectedProgram={selectedProgram}
            loading={programsLoading}
            onProgramSelect={onProgramSelect}
          />
        )}
      </div>

      {/* Specialization Filter Section */}
      {selectedProgram && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Specialization:</span>
            {selectedSpecialization && (
              <div className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {selectedSpecialization.specialization_name}
                <button
                  onClick={onClearSpecialization}
                  className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                  aria-label="Clear specialization filter"
                >
                  <RxCross2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {!selectedSpecialization && (
            <SpecializationGrid
              specializations={specializationsData}
              selectedSpecialization={selectedSpecialization}
              loading={specializationsLoading}
              onSpecializationSelect={onSpecializationSelect}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
