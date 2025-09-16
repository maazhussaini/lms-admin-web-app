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
 * Hook for fetching all enrollments using comma-separated status values
 * Much simpler than the previous multiple API calls approach
 */
function useAllEnrollments() {
  // Single API call with comma-separated statuses
  const result = useApiList<EnrollmentItem>(
    COURSE_API.ENDPOINTS.ENROLLMENTS,
    {
      page: COURSE_API.DEFAULT_PARAMS.PAGE,
      limit: COURSE_API.DEFAULT_PARAMS.LIMIT,
      enrollment_status: 'ACTIVE,COMPLETED,INACTIVE,CANCELLED', // All statuses in one call
    },
    {
      immediate: true,
      retryOnError: true,
      maxRetries: 3,
    }
  );

  // Enhanced debugging for the single API call
  useEffect(() => {
    console.debug('🔍 useAllEnrollments API call result:', {
      loading: result.loading,
      error: result.error,
      dataLength: result.data?.length || 0,
      apiUrl: COURSE_API.ENDPOINTS.ENROLLMENTS,
      requestParams: {
        page: COURSE_API.DEFAULT_PARAMS.PAGE,
        limit: COURSE_API.DEFAULT_PARAMS.LIMIT,
        enrollment_status: 'ACTIVE,COMPLETED,INACTIVE,CANCELLED'
      },
      enrollments: result.data?.map(e => ({
        enrollment_id: e.enrollment_id,
        course_id: e.course_id,
        course_name: e.course_name,
        enrollment_status: e.enrollment_status
      })) || []
    });
  }, [result.loading, result.error, result.data]);

  return result;
}

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
 * Hook for managing active enrollment data
 * Uses shared enrollment data to avoid duplicate API calls
 */
export function useActiveEnrollments(allEnrollmentsResult: any) {
  return useMemo(() => {
    console.debug('🔍 useActiveEnrollments filtering:', {
      allEnrollments: allEnrollmentsResult.data?.map((e: any) => ({
        course_id: e.course_id,
        status: e.enrollment_status
      })) || [],
      totalCount: allEnrollmentsResult.data?.length || 0
    });
    
    const enrolledData = (allEnrollmentsResult.data || []).filter(
      (enrollment: any) => {
        const status = enrollment.enrollment_status?.toUpperCase();
        return status === 'ACTIVE' || status === 'COMPLETED';
      }
    );

    console.debug('🔍 useActiveEnrollments result:', {
      filteredEnrollments: enrolledData.map((e: any) => ({
        course_id: e.course_id,
        status: e.enrollment_status
      })),
      filteredCount: enrolledData.length
    });

    return {
      ...allEnrollmentsResult,
      data: enrolledData,
      pagination: {
        page: 1,
        limit: enrolledData.length,
        total: enrolledData.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }
    };
  }, [allEnrollmentsResult]);
}

/**
 * Hook for managing inactive enrollment data
 * Uses shared enrollment data to avoid duplicate API calls
 */
export function useInactiveEnrollments(allEnrollmentsResult: any) {
  return useMemo(() => {
    const unenrolledData = (allEnrollmentsResult.data || []).filter(
      (enrollment: any) => {
        const status = enrollment.enrollment_status?.toUpperCase();
        return status === 'INACTIVE' || status === 'CANCELLED';
      }
    );

    return {
      ...allEnrollmentsResult,
      data: unenrolledData,
      pagination: {
        page: 1,
        limit: unenrolledData.length,
        total: unenrolledData.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      }
    };
  }, [allEnrollmentsResult]);
}

/**
 * Hook for managing enrollment data (deprecated - use separate hooks above)
 */
export function useEnrollments() {
  // For backward compatibility, we need to make a single API call
  const allEnrollments = useAllEnrollments();
  return useActiveEnrollments(allEnrollments);
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

  // Single API call for all enrollments - this prevents duplicate calls
  const allEnrollmentsHook = useAllEnrollments();
  
  // Filter the enrollment data for different purposes
  const activeEnrollmentsHook = useActiveEnrollments(allEnrollmentsHook);
  const inactiveEnrollmentsHook = useInactiveEnrollments(allEnrollmentsHook);

  // API call for course discovery
  const courseDiscoveryHook = useCourseDiscovery(filterState);

  // Combine enrollment hooks for backward compatibility
  const enrollmentsHook = {
    ...activeEnrollmentsHook,
    data: activeEnrollmentsHook.data || [],
  };
  
  // Derived data
  const transformationContext = useMemo((): CourseTransformationContext => {
    // Only consider ACTIVE and COMPLETED enrollments for enrolled course IDs
    // This allows INACTIVE/CANCELLED courses to appear in discovery results
    const currentlyEnrolledCourses = (activeEnrollmentsHook.data || []);
    return createTransformationContext(currentlyEnrolledCourses);
  }, [activeEnrollmentsHook.data]);

  // Transformed courses
  const transformedCourses = useMemo((): ExtendedCourse[] => {
    // Process active (enrolled) courses
    let enrolledCourses = transformEnrollmentBatch(activeEnrollmentsHook.data || []);
    
    // Process inactive (unenrolled) courses
    let unenrolledCourses = transformEnrollmentBatch(inactiveEnrollmentsHook.data || []);
    
    // Apply API-level filters to enrolled courses when filters are active
    if (filterState.selectedProgram) {
      enrolledCourses = enrolledCourses.filter(course => 
        course.program_name?.toLowerCase() === filterState.selectedProgram?.program_name.toLowerCase()
      );
      unenrolledCourses = unenrolledCourses.filter(course => 
        course.program_name?.toLowerCase() === filterState.selectedProgram?.program_name.toLowerCase()
      );
    }
    
    if (filterState.selectedSpecialization) {
      enrolledCourses = enrolledCourses.filter(course => 
        course.specialization_id === filterState.selectedSpecialization?.specialization_id
      );
      unenrolledCourses = unenrolledCourses.filter(course => 
        course.specialization_id === filterState.selectedSpecialization?.specialization_id
      );
    }
    
    if (filterState.searchQuery.trim()) {
      const query = filterState.searchQuery.toLowerCase();
      const searchFilter = (course: ExtendedCourse) => 
        course.course_name.toLowerCase().includes(query) ||
        course.program_name?.toLowerCase().includes(query) ||
        course.teacher_name?.toLowerCase().includes(query);
      
      enrolledCourses = enrolledCourses.filter(searchFilter);
      unenrolledCourses = unenrolledCourses.filter(searchFilter);
    }
    
    if (activeTab === 'enrolled') {
      return enrolledCourses;
    }

    if (activeTab === 'unenrolled') {
      return unenrolledCourses;
    }

    // All courses: combine enrolled + unenrolled + discovery
    const discoveredCourses = (courseDiscoveryHook.data || [])
      .filter(course => !transformationContext.enrolledCourseIds.has(course.course_id));
    const transformedDiscoveredCourses = transformCourseDiscoveryBatch(discoveredCourses);
    
    return [...enrolledCourses, ...unenrolledCourses, ...transformedDiscoveredCourses];
  }, [
    activeTab,
    courseDiscoveryHook.data,
    activeEnrollmentsHook.data,
    inactiveEnrollmentsHook.data,
    transformationContext.enrolledCourseIds,
    filterState
  ]);

  // Filtered courses
  const filteredCourses = useMemo((): ExtendedCourse[] => {
    // Skip API-level filters since they're already applied in the discovery API call
    const hasApiLevelFilters = !!(
      filterState.selectedProgram || 
      filterState.selectedSpecialization || 
      filterState.searchQuery.trim()
    );
    
    return applyAllFilters(transformedCourses, filterState, hasApiLevelFilters);
  }, [transformedCourses, filterState]);

  // Progress data
  const progressData = useMemo((): StudentCourseProgress[] => {
    return createProgressBatch(enrollmentsHook.data || []);
  }, [enrollmentsHook.data]);

  // Course counts for tabs
  const courseCounts = useMemo((): CourseCounts => {
    // Count courses based on the current filter state (same as transformedCourses logic)
    let enrolledCourses = transformEnrollmentBatch(activeEnrollmentsHook.data || []);
    let unenrolledCourses = transformEnrollmentBatch(inactiveEnrollmentsHook.data || []);
    
    // Apply the same filtering logic as transformedCourses
    if (filterState.selectedProgram) {
      enrolledCourses = enrolledCourses.filter(course => 
        course.program_name?.toLowerCase() === filterState.selectedProgram?.program_name.toLowerCase()
      );
      unenrolledCourses = unenrolledCourses.filter(course => 
        course.program_name?.toLowerCase() === filterState.selectedProgram?.program_name.toLowerCase()
      );
    }
    
    if (filterState.selectedSpecialization) {
      enrolledCourses = enrolledCourses.filter(course => 
        course.specialization_id === filterState.selectedSpecialization?.specialization_id
      );
      unenrolledCourses = unenrolledCourses.filter(course => 
        course.specialization_id === filterState.selectedSpecialization?.specialization_id
      );
    }
    
    if (filterState.searchQuery.trim()) {
      const query = filterState.searchQuery.toLowerCase();
      const searchFilter = (course: ExtendedCourse) => 
        course.course_name.toLowerCase().includes(query) ||
        course.program_name?.toLowerCase().includes(query) ||
        course.teacher_name?.toLowerCase().includes(query);
      
      enrolledCourses = enrolledCourses.filter(searchFilter);
      unenrolledCourses = unenrolledCourses.filter(searchFilter);
    }
    
    // Count filtered discovery courses (only courses not currently enrolled)
    let discoveredCourses = (courseDiscoveryHook.data || [])
      .filter(course => !transformationContext.enrolledCourseIds.has(course.course_id));
    
    // Apply course type filter to discovery courses
    if (filterState.selectedCourseType !== 'all') {
      discoveredCourses = discoveredCourses.filter(course => {
        if (filterState.selectedCourseType === 'free') {
          return course.is_free === true;
        } else if (filterState.selectedCourseType === 'paid') {
          return course.is_free === false;
        }
        return true;
      });
    }
    
    const enrolledCount = enrolledCourses.length;
    const unenrolledCount = unenrolledCourses.length;
    const discoveryCount = discoveredCourses.length;
    const totalCount = enrolledCount + unenrolledCount + discoveryCount;

    console.debug('📊 Calculating course counts', {
      enrolled: enrolledCount,
      unenrolled: unenrolledCount,
      discovery: discoveryCount,
      total: totalCount,
      enrolledCourseIds: Array.from(transformationContext.enrolledCourseIds),
      filterState: {
        program: filterState.selectedProgram?.program_name || 'none',
        specialization: filterState.selectedSpecialization?.specialization_name || 'none',
        search: filterState.searchQuery || 'none',
        courseType: filterState.selectedCourseType
      }
    });

    return {
      all: totalCount,
      enrolled: enrolledCount,
      unenrolled: unenrolledCount,
    };
  }, [
    activeEnrollmentsHook.data,
    inactiveEnrollmentsHook.data,
    courseDiscoveryHook.data,
    transformationContext.enrolledCourseIds,
    filterState
  ]);

  // Loading and error states
  const isLoading = courseDiscoveryHook.loading || allEnrollmentsHook.loading;
  const error = courseDiscoveryHook.error || allEnrollmentsHook.error;

  // Retry function
  const retry = useCallback(() => {
    courseDiscoveryHook.refetch();
    allEnrollmentsHook.refetch();
  }, [courseDiscoveryHook, allEnrollmentsHook]);

  // Debug logging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Course data state:', {
        activeTab,
        filterState,
        filterStateDetails: {
          searchQuery: `"${filterState.searchQuery}"`,
          selectedProgram: filterState.selectedProgram?.program_name || 'null',
          selectedSpecialization: filterState.selectedSpecialization?.specialization_name || 'null',
          selectedCourseType: `"${filterState.selectedCourseType}"`
        },
        // API data with enrollment statuses
        discoveryData: courseDiscoveryHook.data,
        discoveryDataCount: courseDiscoveryHook.data?.length || 0,
        allEnrollmentsData: allEnrollmentsHook.data?.map(e => ({
          course_id: e.course_id,
          enrollment_status: e.enrollment_status
        })),
        allEnrollmentsCount: allEnrollmentsHook.data?.length || 0,
        activeEnrollmentsData: activeEnrollmentsHook.data?.map((e: any) => ({
          course_id: e.course_id,
          enrollment_status: e.enrollment_status
        })),
        activeEnrollmentsCount: activeEnrollmentsHook.data?.length || 0,
        inactiveEnrollmentsData: inactiveEnrollmentsHook.data?.map((e: any) => ({
          course_id: e.course_id,
          enrollment_status: e.enrollment_status
        })),
        inactiveEnrollmentsCount: inactiveEnrollmentsHook.data?.length || 0,
        // Transformation context (only includes ACTIVE/COMPLETED courses)
        enrolledCourseIds: Array.from(transformationContext.enrolledCourseIds),
        // Transformed data
        totalCourses: transformedCourses.length,
        transformedCoursesData: transformedCourses.map(c => ({
          course_id: c.course_id,
          course_name: c.course_name
        })),
        // Final filtered data
        filteredCourses: filteredCourses.length,
        filteredCoursesData: filteredCourses.map(c => ({
          course_id: c.course_id,
          course_name: c.course_name
        })),
        courseCounts,
        isLoading,
        hasError: !!error,
      });
    }
  }, [activeTab, filterState, courseDiscoveryHook.data, allEnrollmentsHook.data, activeEnrollmentsHook.data, inactiveEnrollmentsHook.data, transformationContext, transformedCourses, filteredCourses, courseCounts, isLoading, error]);

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
