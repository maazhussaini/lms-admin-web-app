/**
 * @file utils/courseFilters.ts
 * @description Course filtering utilities following DRY principle
 * Centralized filtering logic for course data
 */

import type { 
  ExtendedCourse, 
  CourseFilterState 
} from '@/types/course.ui.types';
import type { Program, Specialization } from '@/services';
import { 
  COURSE_FILTER_TYPES, 
  PERFORMANCE_LOGGING 
} from '@/constants/course.constants';

/**
 * Performance logging for filter operations
 */
const logFilterPerformance = (operation: string, startTime: number, inputCount: number, outputCount: number): void => {
  if (PERFORMANCE_LOGGING.ENABLED) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`🔍 ${operation} took ${duration.toFixed(2)}ms: ${inputCount} → ${outputCount} courses`);
    
    if (duration > PERFORMANCE_LOGGING.THRESHOLDS.FILTER_WARNING) {
      console.warn(`⚠️ ${operation} exceeded performance threshold`);
    }
  }
};

/**
 * Filter courses by program
 */
export const filterByProgram = (
  courses: ExtendedCourse[], 
  selectedProgram: Program | null
): ExtendedCourse[] => {
  if (!selectedProgram) return courses;
  return courses.filter(course => 
    course.program_name?.toLowerCase() === selectedProgram.program_name.toLowerCase()
  );
};

/**
 * Filter courses by specialization
 */
export const filterBySpecialization = (
  courses: ExtendedCourse[], 
  selectedSpecialization: Specialization | null
): ExtendedCourse[] => {
  if (!selectedSpecialization) return courses;
  return courses.filter(course => 
    course.specialization_id === selectedSpecialization.specialization_id
  );
};

/**
 * Filter courses by type (free, paid, purchased)
 */
export const filterByCourseType = (
  courses: ExtendedCourse[], 
  courseType: string
): ExtendedCourse[] => {
  if (courseType === COURSE_FILTER_TYPES.ALL) {
    return courses;
  }

  return courses.filter(course => {
    const isPaid = course.course_type === 'PAID' || (course.course_price && course.course_price > 0);
    const isPurchased = course.is_purchased || false;
    
    switch (courseType) {
      case COURSE_FILTER_TYPES.FREE:
        return !isPaid;
      case COURSE_FILTER_TYPES.PAID:
        return isPaid && !isPurchased;
      case COURSE_FILTER_TYPES.PURCHASED:
        return isPurchased;
      default:
        return true;
    }
  });
};

/**
 * Filter courses by search query
 */
export const filterBySearchQuery = (
  courses: ExtendedCourse[], 
  searchQuery: string
): ExtendedCourse[] => {
  if (!searchQuery.trim()) {
    return courses;
  }

  const query = searchQuery.toLowerCase();
  return courses.filter(course => 
    course.course_name.toLowerCase().includes(query) ||
    course.program_name?.toLowerCase().includes(query) ||
    course.teacher_name?.toLowerCase().includes(query)
  );
};

/**
 * Apply all filters to course list
 * Optimized single-pass filtering
 */
export const applyAllFilters = (
  courses: ExtendedCourse[],
  filterState: CourseFilterState
): ExtendedCourse[] => {
  const startTime = performance.now();
  
  let filteredCourses = courses;

  // Apply program filter
  if (filterState.selectedProgram) {
    filteredCourses = filterByProgram(filteredCourses, filterState.selectedProgram);
  }
  
  // Apply specialization filter
  if (filterState.selectedSpecialization) {
    filteredCourses = filterBySpecialization(filteredCourses, filterState.selectedSpecialization);
  }  // Apply course type filter
  if (filterState.selectedCourseType !== COURSE_FILTER_TYPES.ALL) {
    filteredCourses = filterByCourseType(filteredCourses, filterState.selectedCourseType);
  }

  // Apply search filter
  if (filterState.searchQuery.trim()) {
    filteredCourses = filterBySearchQuery(filteredCourses, filterState.searchQuery);
  }

  logFilterPerformance('Complete filter operation', startTime, courses.length, filteredCourses.length);
  
  return filteredCourses;
};

/**
 * Check if any filters are active
 */
export const hasActiveFilters = (filterState: CourseFilterState): boolean => {
  return filterState.selectedProgram !== null || 
         filterState.selectedSpecialization !== null || 
         filterState.selectedCourseType !== COURSE_FILTER_TYPES.ALL ||
         filterState.searchQuery.trim() !== '';
};

/**
 * Reset all filters to default state
 */
export const createDefaultFilterState = (): CourseFilterState => ({
  searchQuery: '',
  selectedProgram: null,
  selectedSpecialization: null,
  selectedCourseType: COURSE_FILTER_TYPES.ALL,
});

/**
 * Filter courses by enrollment status for tab functionality
 */
export const filterByEnrollmentStatus = (
  courses: ExtendedCourse[],
  enrolledCourseIds: Set<number>,
  status: 'all' | 'enrolled' | 'unenrolled'
): ExtendedCourse[] => {
  switch (status) {
    case 'enrolled':
      return courses.filter(course => enrolledCourseIds.has(course.course_id));
    case 'unenrolled':
      return courses.filter(course => !enrolledCourseIds.has(course.course_id));
    case 'all':
    default:
      return courses;
  }
};
