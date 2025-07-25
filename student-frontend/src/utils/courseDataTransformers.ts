/**
 * @file utils/courseDataTransformers.ts
 * @description Data transformation utilities for course components
 * Centralizes data conversion and mapping logic
 */

import type { Course, StudentCourseProgress } from '@shared/types';
import type { ExtendedCourse, CourseWithProgress } from '@/types/course.ui.types';

/**
 * Convert ExtendedCourse to base Course type for compatibility
 * 
 * @param extendedCourse - Extended course with UI-specific fields
 * @returns Base Course type for API compatibility
 */
export function convertExtendedToCourse(extendedCourse: ExtendedCourse): Course {
  return {
    course_id: extendedCourse.course_id,
    course_name: extendedCourse.course_name,
    course_description: extendedCourse.course_description,
    main_thumbnail_url: extendedCourse.main_thumbnail_url,
    course_total_hours: typeof extendedCourse.course_total_hours === 'number' ? extendedCourse.course_total_hours : null,
    course_type: extendedCourse.course_type as 'FREE' | 'PAID', // Remove PURCHASED for base type
    course_price: extendedCourse.course_price ?? null,
    specialization_id: extendedCourse.specialization_id,
    // Required fields for base Course type
    course_status: 'PUBLIC' as const,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  };
}

/**
 * Find progress data for a specific course
 * 
 * @param courseId - Course ID to find progress for
 * @param progressData - Array of progress data
 * @returns Progress data for the course or undefined
 */
export function getProgressForCourse(
  courseId: number, 
  progressData: StudentCourseProgress[]
): StudentCourseProgress | undefined {
  return progressData.find(progress => progress.course_id === courseId);
}

/**
 * Combine course data with progress information
 * 
 * @param courses - Array of extended courses
 * @param progressData - Array of progress data
 * @returns Array of courses with associated progress
 */
export function combineCoursesWithProgress(
  courses: ExtendedCourse[],
  progressData: StudentCourseProgress[]
): CourseWithProgress[] {
  return courses.map(course => ({
    course,
    progress: getProgressForCourse(course.course_id, progressData)
  }));
}

/**
 * Filter courses by enrollment status
 * 
 * @param courses - Array of extended courses
 * @param progressData - Array of progress data (indicates enrollment)
 * @param filterType - Type of filter to apply
 * @returns Filtered courses array
 */
export function filterCoursesByEnrollment(
  courses: ExtendedCourse[],
  progressData: StudentCourseProgress[],
  filterType: 'all' | 'enrolled' | 'unenrolled'
): ExtendedCourse[] {
  if (filterType === 'all') return courses;
  
  const enrolledCourseIds = new Set(progressData.map(p => p.course_id));
  
  if (filterType === 'enrolled') {
    return courses.filter(course => enrolledCourseIds.has(course.course_id));
  }
  
  if (filterType === 'unenrolled') {
    return courses.filter(course => !enrolledCourseIds.has(course.course_id));
  }
  
  return courses;
}

/**
 * Calculate course counts for different categories
 * 
 * @param courses - Array of extended courses
 * @param progressData - Array of progress data
 * @returns Course counts for each category
 */
export function calculateCourseCounts(
  courses: ExtendedCourse[],
  progressData: StudentCourseProgress[]
): { all: number; enrolled: number; unenrolled: number } {
  const enrolledCourseIds = new Set(progressData.map(p => p.course_id));
  
  return {
    all: courses.length,
    enrolled: courses.filter(course => enrolledCourseIds.has(course.course_id)).length,
    unenrolled: courses.filter(course => !enrolledCourseIds.has(course.course_id)).length,
  };
}
