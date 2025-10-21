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
 * Hook for fetching enrolled courses (ACTIVE + COMPLETED statuses)
 * Makes a separate API call to get only currently enrolled courses
 * 
 * @param searchQuery - Optional search query to filter courses
 * @returns API result with enrolled courses and pagination data
 * 
 * Note: Backend doesn't return enrollment_status in response items,
 * so we rely on API-level filtering via query parameters.
 */
function useEnrolledCourses(searchQuery: string = '') {
  // Build API parameters
  const apiParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: COURSE_API.DEFAULT_PARAMS.PAGE,
      limit: COURSE_API.DEFAULT_PARAMS.LIMIT,
      enrollment_status: 'ACTIVE,COMPLETED', // Only currently enrolled courses
    };

    // Add search query if provided
    if (searchQuery.trim()) {
      params.search_query = searchQuery;
    }

    return params;
  }, [searchQuery]);

  const result = useApiList<EnrollmentItem>(
    COURSE_API.ENDPOINTS.ENROLLMENTS,
    apiParams,
    {
      immediate: true,
      retryOnError: true,
      maxRetries: 3,
    }
  );

  // Debug logging
  useEffect(() => {
    console.debug('� useEnrolledCourses API call result:', {
      loading: result.loading,
      error: result.error,
      dataLength: result.data?.length || 0,
      paginationTotal: result.pagination?.total || 0,
      searchQuery: searchQuery || 'none',
      enrollments: result.data?.map(e => ({
        enrollment_id: e.enrollment_id,
        course_id: e.course_id,
        course_name: e.course_name,
      })) || []
    });
  }, [result.loading, result.error, result.data, result.pagination, searchQuery]);

  return result;
}

/**
 * Hook for fetching unenrolled/dropped courses (INACTIVE + CANCELLED statuses)
 * Makes a separate API call to get courses the student has left/cancelled
 * 
 * @param searchQuery - Optional search query to filter courses
 * @returns API result with unenrolled courses and pagination data
 * 
 * Note: Frontend uses INACTIVE/CANCELLED but backend controller maps these to DROPPED enum.
 * Backend doesn't return enrollment_status in response items, so we rely on API-level filtering.
 */
function useUnenrolledCourses(searchQuery: string = '') {
  // Build API parameters
  const apiParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: COURSE_API.DEFAULT_PARAMS.PAGE,
      limit: COURSE_API.DEFAULT_PARAMS.LIMIT,
      enrollment_status: 'INACTIVE,CANCELLED', // Backend maps to DROPPED
    };

    // Add search query if provided
    if (searchQuery.trim()) {
      params.search_query = searchQuery;
    }

    return params;
  }, [searchQuery]);

  const result = useApiList<EnrollmentItem>(
    COURSE_API.ENDPOINTS.ENROLLMENTS,
    apiParams,
    {
      immediate: true,
      retryOnError: true,
      maxRetries: 3,
    }
  );

  // Debug logging
  useEffect(() => {
    console.debug('📕 useUnenrolledCourses API call result:', {
      loading: result.loading,
      error: result.error,
      dataLength: result.data?.length || 0,
      paginationTotal: result.pagination?.total || 0,
      searchQuery: searchQuery || 'none',
      enrollments: result.data?.map(e => ({
        enrollment_id: e.enrollment_id,
        course_id: e.course_id,
        course_name: e.course_name,
      })) || []
    });
  }, [result.loading, result.error, result.data, result.pagination, searchQuery]);

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
      params.search_query = filterState.searchQuery;
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

  // Two separate API calls for enrolled and unenrolled courses
  // Pass search query to both APIs for server-side filtering
  const enrolledCoursesHook = useEnrolledCourses(filterState.searchQuery);
  const unenrolledCoursesHook = useUnenrolledCourses(filterState.searchQuery);

  // API call for course discovery
  const courseDiscoveryHook = useCourseDiscovery(filterState);

  // Combine enrollment hooks for backward compatibility
  const enrollmentsHook = {
    ...enrolledCoursesHook,
    data: enrolledCoursesHook.data || [],
  };
  
  // Derived data - transformation context uses enrolled courses only
  const transformationContext = useMemo((): CourseTransformationContext => {
    // Only consider currently enrolled courses (ACTIVE and COMPLETED)
    return createTransformationContext(enrolledCoursesHook.data || []);
  }, [enrolledCoursesHook.data]);

  // Transformed courses - using new separate enrollment hooks
  const transformedCourses = useMemo((): ExtendedCourse[] => {
    // Process enrolled courses (ACTIVE + COMPLETED) - API already filters by search query
    let enrolledCourses = transformEnrollmentBatch(enrolledCoursesHook.data || []);
    
    // Process unenrolled courses (INACTIVE + CANCELLED → DROPPED) - API already filters by search query
    let unenrolledCourses = transformEnrollmentBatch(unenrolledCoursesHook.data || []);
    
    // Apply client-side filters for program and specialization (not supported by enrollments API)
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
    
    // Return appropriate courses based on active tab
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
    enrolledCoursesHook.data,
    unenrolledCoursesHook.data,
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

  // Course counts for tabs - using API pagination totals
  const courseCounts = useMemo((): CourseCounts => {
    // Get base counts from API pagination (already includes search query filtering)
    const enrolledCount = enrolledCoursesHook.pagination?.total || 0;
    const unenrolledCount = unenrolledCoursesHook.pagination?.total || 0;
    
    // Apply client-side filters to get accurate filtered counts
    let filteredEnrolledCount = enrolledCount;
    let filteredUnenrolledCount = unenrolledCount;
    
    // If we have program or specialization filters, we need to count filtered courses
    if (filterState.selectedProgram || filterState.selectedSpecialization) {
      // Transform and filter enrolled courses
      let enrolledCourses = transformEnrollmentBatch(enrolledCoursesHook.data || []);
      let unenrolledCourses = transformEnrollmentBatch(unenrolledCoursesHook.data || []);
      
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
      
      filteredEnrolledCount = enrolledCourses.length;
      filteredUnenrolledCount = unenrolledCourses.length;
    }
    
    // Count discovery courses (exclude currently enrolled courses)
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
    
    const discoveryCount = discoveredCourses.length;
    const totalCount = filteredEnrolledCount + filteredUnenrolledCount + discoveryCount;

    console.debug('📊 Calculating course counts', {
      enrolled: filteredEnrolledCount,
      enrolledFromAPI: enrolledCount,
      unenrolled: filteredUnenrolledCount,
      unenrolledFromAPI: unenrolledCount,
      discovery: discoveryCount,
      total: totalCount,
      hasFilters: !!(filterState.selectedProgram || filterState.selectedSpecialization),
      filterState: {
        program: filterState.selectedProgram?.program_name || 'none',
        specialization: filterState.selectedSpecialization?.specialization_name || 'none',
        search: filterState.searchQuery || 'none',
        courseType: filterState.selectedCourseType
      }
    });

    return {
      all: totalCount,
      enrolled: filteredEnrolledCount,
      unenrolled: filteredUnenrolledCount,
    };
  }, [
    enrolledCoursesHook.data,
    enrolledCoursesHook.pagination,
    unenrolledCoursesHook.data,
    unenrolledCoursesHook.pagination,
    courseDiscoveryHook.data,
    transformationContext.enrolledCourseIds,
    filterState
  ]);

  // Loading and error states - combine both enrollment hooks and discovery
  const isLoading = courseDiscoveryHook.loading || enrolledCoursesHook.loading || unenrolledCoursesHook.loading;
  const error = courseDiscoveryHook.error || enrolledCoursesHook.error || unenrolledCoursesHook.error;

  // Retry function - refetch all APIs
  const retry = useCallback(() => {
    courseDiscoveryHook.refetch();
    enrolledCoursesHook.refetch();
    unenrolledCoursesHook.refetch();
  }, [courseDiscoveryHook, enrolledCoursesHook, unenrolledCoursesHook]);

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
        // API data from new separate hooks
        discoveryData: courseDiscoveryHook.data,
        discoveryDataCount: courseDiscoveryHook.data?.length || 0,
        enrolledCoursesData: enrolledCoursesHook.data?.map(e => ({
          course_id: e.course_id,
          course_name: e.course_name,
        })),
        enrolledCoursesCount: enrolledCoursesHook.data?.length || 0,
        enrolledPaginationTotal: enrolledCoursesHook.pagination?.total || 0,
        unenrolledCoursesData: unenrolledCoursesHook.data?.map(e => ({
          course_id: e.course_id,
          course_name: e.course_name,
        })),
        unenrolledCoursesCount: unenrolledCoursesHook.data?.length || 0,
        unenrolledPaginationTotal: unenrolledCoursesHook.pagination?.total || 0,
        // Transformation context (only includes enrolled courses)
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
  }, [activeTab, filterState, courseDiscoveryHook.data, enrolledCoursesHook.data, enrolledCoursesHook.pagination, unenrolledCoursesHook.data, unenrolledCoursesHook.pagination, transformationContext, transformedCourses, filteredCourses, courseCounts, isLoading, error]);

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
