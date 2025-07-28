/**
 * @file hooks/useCourseData.ts
 * @description Custom hooks for course data management
 * Separates business logic from UI components following Single Responsibility Principle
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useApiList } from '@/hooks/useApi';
import type { 
  ExtendedCourse, 
  CourseTab, 
  CourseCounts, 
  CourseFilterState,
  CourseTransformationContext 
} from '@/types/course.ui.types';
import type { StudentCourseProgress } from '@shared/types/course.types';
import type { 
  CourseDiscoveryItem, 
  EnrollmentItem, 
  Program, 
  Specialization 
} from '@/services';
import { 
  transformCourseDiscoveryBatch, 
  transformEnrollmentBatch, 
  createProgressBatch,
  createTransformationContext 
} from '@/utils/courseTransformers';
import { 
  applyAllFilters,
  hasActiveFilters as checkActiveFilters,
  createDefaultFilterState 
} from '@/utils/courseFilters';
import { COURSE_API } from '@/constants/course.constants';

/**
 * Hook for managing course discovery data
 */
export function useCourseDiscovery(filterState: CourseFilterState) {
  // Build API parameters from filter state
  const apiParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: COURSE_API.DEFAULT_PARAMS.PAGE,
      limit: COURSE_API.DEFAULT_PARAMS.LIMIT,
    };

    if (filterState.searchQuery.trim()) {
      params.search = filterState.searchQuery;
    }

    if (filterState.selectedProgram) {
      params.program_id = filterState.selectedProgram.program_id.toString();
    }

    if (filterState.selectedSpecialization) {
      params.specialization_id = filterState.selectedSpecialization.specialization_id.toString();
    }

    return params;
  }, [filterState]);

  return useApiList<CourseDiscoveryItem>(
    COURSE_API.ENDPOINTS.DISCOVER,
    apiParams,
    {
      immediate: true,
      retryOnError: true,
      maxRetries: 3,
    }
  );
}

/**
 * Hook for managing enrollment data
 */
export function useEnrollments() {
  return useApiList<EnrollmentItem>(
    COURSE_API.ENDPOINTS.ENROLLMENTS,
    {
      page: COURSE_API.DEFAULT_PARAMS.PAGE,
      limit: COURSE_API.DEFAULT_PARAMS.LIMIT,
      status: COURSE_API.DEFAULT_PARAMS.ENROLLMENT_STATUS,
    },
    {
      immediate: true,
      retryOnError: true,
      maxRetries: 3,
    }
  );
}

/**
 * Hook for managing course filter state
 */
export function useCourseFilters() {
  const [filterState, setFilterState] = useState<CourseFilterState>(createDefaultFilterState);

  const updateSearchQuery = useCallback((searchQuery: string) => {
    setFilterState(prev => ({ ...prev, searchQuery }));
  }, []);

  const updateProgram = useCallback((program: Program | null) => {
    setFilterState(prev => ({ 
      ...prev, 
      selectedProgram: program,
      selectedSpecialization: null // Clear specialization when program changes
    }));
  }, []);

  const updateSpecialization = useCallback((specialization: Specialization | null) => {
    setFilterState(prev => ({ 
      ...prev, 
      selectedSpecialization: specialization
    }));
  }, []);

  const updateCourseType = useCallback((courseType: CourseFilterState['selectedCourseType']) => {
    setFilterState(prev => ({ ...prev, selectedCourseType: courseType }));
  }, []);

  const clearProgram = useCallback(() => {
    setFilterState(prev => ({ 
      ...prev, 
      selectedProgram: null, 
      selectedSpecialization: null 
    }));
  }, []);

  const clearSpecialization = useCallback(() => {
    setFilterState(prev => ({ ...prev, selectedSpecialization: null }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterState(createDefaultFilterState());
  }, []);

  const hasActiveFilters = useMemo(() => 
    checkActiveFilters(filterState), 
    [filterState]
  );

  return {
    filterState,
    updateSearchQuery,
    updateProgram,
    updateSpecialization,
    updateCourseType,
    clearProgram,
    clearSpecialization,
    clearAllFilters,
    hasActiveFilters,
  };
}

/**
 * Main hook for course data management
 * Combines all course-related data and logic
 */
export function useCourseData() {
  const [activeTab, setActiveTab] = useState<CourseTab>('all');
  const filterHook = useCourseFilters();
  const { filterState } = filterHook;

  // API calls
  const courseDiscoveryHook = useCourseDiscovery(filterState);
  const enrollmentsHook = useEnrollments();

  // Derived data
  const transformationContext = useMemo((): CourseTransformationContext => {
    return createTransformationContext(enrollmentsHook.data || []);
  }, [enrollmentsHook.data]);

  // Transformed courses
  const transformedCourses = useMemo((): ExtendedCourse[] => {
    const enrolledCourses = transformEnrollmentBatch(enrollmentsHook.data || []);
    
    if (activeTab === 'enrolled') {
      return enrolledCourses;
    }

    if (activeTab === 'unenrolled') {
      const unenrolledDiscovery = (courseDiscoveryHook.data || [])
        .filter(course => !transformationContext.enrolledCourseIds.has(course.course_id));
      return transformCourseDiscoveryBatch(unenrolledDiscovery);
    }

    // All courses: combine enrolled + unenrolled
    const unenrolledDiscovery = (courseDiscoveryHook.data || [])
      .filter(course => !transformationContext.enrolledCourseIds.has(course.course_id));
    const unenrolledCourses = transformCourseDiscoveryBatch(unenrolledDiscovery);
    
    return [...enrolledCourses, ...unenrolledCourses];
  }, [
    activeTab,
    courseDiscoveryHook.data,
    enrollmentsHook.data,
    transformationContext.enrolledCourseIds
  ]);

  // Filtered courses
  const filteredCourses = useMemo((): ExtendedCourse[] => {
    return applyAllFilters(transformedCourses, filterState);
  }, [transformedCourses, filterState]);

  // Progress data
  const progressData = useMemo((): StudentCourseProgress[] => {
    return createProgressBatch(enrollmentsHook.data || []);
  }, [enrollmentsHook.data]);

  // Course counts for tabs
  const courseCounts = useMemo((): CourseCounts => {
    const allCoursesCount = courseDiscoveryHook.pagination?.total || courseDiscoveryHook.data?.length || 0;
    const enrolledCount = enrollmentsHook.pagination?.total || enrollmentsHook.data?.length || 0;
    const unenrolledCount = Math.max(0, allCoursesCount - enrolledCount);

    return {
      all: allCoursesCount,
      enrolled: enrolledCount,
      unenrolled: unenrolledCount,
    };
  }, [
    courseDiscoveryHook.pagination,
    courseDiscoveryHook.data,
    enrollmentsHook.pagination,
    enrollmentsHook.data
  ]);

  // Loading and error states
  const isLoading = courseDiscoveryHook.loading || enrollmentsHook.loading;
  const error = courseDiscoveryHook.error || enrollmentsHook.error;

  // Retry function
  const retry = useCallback(() => {
    courseDiscoveryHook.refetch();
    enrollmentsHook.refetch();
  }, [courseDiscoveryHook, enrollmentsHook]);

  // Debug logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Course data state:', {
        activeTab,
        filterState,
        totalCourses: transformedCourses.length,
        filteredCourses: filteredCourses.length,
        courseCounts,
        isLoading,
        hasError: !!error,
      });
    }
  }, [activeTab, filterState, transformedCourses.length, filteredCourses.length, courseCounts, isLoading, error]);

  return {
    // Data
    courses: filteredCourses,
    progressData,
    courseCounts,
    transformationContext,
    
    // State
    activeTab,
    setActiveTab,
    
    // Filter management
    ...filterHook,
    
    // Loading and error states
    isLoading,
    error,
    retry,
    
    // Raw API hooks for advanced usage
    courseDiscoveryHook,
    enrollmentsHook,
  };
}
