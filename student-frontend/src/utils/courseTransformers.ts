/**
 * @file utils/courseTransformers.ts
 * @description Data transformation utilities for course data
 * Implements DRY principle for course data conversion
 */

import type { 
  ExtendedCourse, 
  CourseTransformationContext 
} from '@/types/course.ui.types';
import type { StudentCourseProgress } from '@shared/types/course.types';
import type { 
  CourseDiscoveryItem, 
  EnrollmentItem 
} from '@/services';
import { 
  COURSE_TYPES, 
  PROGRESS, 
  PERFORMANCE_LOGGING 
} from '@/constants/course.constants';

/**
 * Performance utility for logging transformation times
 */
const logPerformance = (operation: string, startTime: number, itemCount: number): void => {
  if (PERFORMANCE_LOGGING.ENABLED) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`🔄 ${operation} took ${duration.toFixed(2)}ms for ${itemCount} items`);
    
    if (duration > PERFORMANCE_LOGGING.THRESHOLDS.TRANSFORMATION_WARNING) {
      console.warn(`⚠️ ${operation} exceeded performance threshold`);
    }
  }
};

/**
 * Utility to parse course duration from various formats (string or number)
 */
const parseCourseHours = (hoursInput: string | number): number => {
  if (!hoursInput) return 0;
  
  // If it's already a number, return it directly
  if (typeof hoursInput === 'number') {
    return hoursInput;
  }
  
  // Handle string formats: "24 hrs", "24h", "24.5 hrs", etc.
  const match = hoursInput.match(/(\d+\.?\d*)/);
  return match && match[1] ? parseFloat(match[1]) : 0;
};

/**
 * Utility to extract price from purchase status string
 */
const extractPriceFromStatus = (purchaseStatus: string): number => {
  if (!purchaseStatus || !purchaseStatus.includes('Buy: $')) {
    return 0;
  }
  
  const priceMatch = purchaseStatus.match(/\$(\d+\.?\d*)/);
  return priceMatch && priceMatch[1] ? parseFloat(priceMatch[1]) : 0;
};

/**
 * Base course transformer with common logic
 */
const createBaseCourse = (
  courseId: number,
  courseName: string,
  programName: string,
  teacherName: string,
  teacherQualification: string | null,
  profilePictureUrl: string | null,
  startDate: string,
  endDate: string,
  courseHoursInput: string | number
): Omit<ExtendedCourse, 'course_description' | 'purchase_status' | 'is_purchased' | 'course_type' | 'course_price' | 'specialization_id'> => ({
  course_id: courseId,
  course_name: courseName,
  main_thumbnail_url: profilePictureUrl,
  course_total_hours: parseCourseHours(courseHoursInput),
  teacher_name: teacherName,
  teacher_qualification: teacherQualification,
  program_name: programName,
  profile_picture_url: profilePictureUrl,
  start_date: startDate,
  end_date: endDate,
});

/**
 * Convert CourseDiscoveryItem to ExtendedCourse
 * Used for courses from discovery API
 */
export const transformCourseDiscovery = (item: CourseDiscoveryItem): ExtendedCourse => {
  const baseCourse = createBaseCourse(
    item.course_id,
    item.course_name,
    item.program_name,
    item.teacher_name,
    item.teacher_qualification,
    item.profile_picture_url,
    item.start_date,
    item.end_date,
    item.course_total_hours
  );

  const price = extractPriceFromStatus(item.purchase_status);
  const courseType = (item.is_free || item.is_purchased) ? COURSE_TYPES.FREE : COURSE_TYPES.PAID;

  return {
    ...baseCourse,
    course_description: item.program_name,
    purchase_status: item.purchase_status,
    is_purchased: item.is_purchased,
    course_type: courseType as 'FREE' | 'PAID',
    course_price: price,
    specialization_id: 1, // Default since not provided in discovery API
  };
};

/**
 * Convert EnrollmentItem to ExtendedCourse
 * Used for enrolled courses
 */
export const transformEnrollment = (item: EnrollmentItem): ExtendedCourse => {
  const baseCourse = createBaseCourse(
    item.course_id,
    item.course_name,
    item.program_name,
    item.teacher_name,
    item.teacher_qualification,
    item.profile_picture_url,
    item.start_date,
    item.end_date,
    item.course_total_hours
  );

  return {
    ...baseCourse,
    course_description: `${item.program_name} • ${item.specialization_name}`,
    purchase_status: COURSE_TYPES.PURCHASED,
    is_purchased: true,
    course_type: COURSE_TYPES.PAID as 'FREE' | 'PAID',
    course_price: 0,
    specialization_id: item.specialization_id,
  };
};

/**
 * Batch transform course discovery items
 * Optimized for performance with large datasets
 */
export const transformCourseDiscoveryBatch = (items: CourseDiscoveryItem[]): ExtendedCourse[] => {
  const startTime = performance.now();
  const transformed = items.map(transformCourseDiscovery);
  logPerformance('Course discovery transformation', startTime, items.length);
  return transformed;
};

/**
 * Batch transform enrollment items
 * Optimized for performance with large datasets
 */
export const transformEnrollmentBatch = (items: EnrollmentItem[]): ExtendedCourse[] => {
  const startTime = performance.now();
  const transformed = items.map(transformEnrollment);
  logPerformance('Enrollment transformation', startTime, items.length);
  return transformed;
};

/**
 * Create StudentCourseProgress from EnrollmentItem
 * Unified progress data creation
 */
export const createProgressFromEnrollment = (item: EnrollmentItem): StudentCourseProgress => ({
  student_course_progress_id: item.enrollment_id,
  student_id: 1, // TODO: Get from auth context
  course_id: item.course_id,
  overall_progress_percentage: item.overall_progress_percentage,
  modules_completed: PROGRESS.DEFAULT_VALUES.MODULES_COMPLETED,
  videos_completed: PROGRESS.DEFAULT_VALUES.VIDEOS_COMPLETED,
  quizzes_completed: PROGRESS.DEFAULT_VALUES.QUIZZES_COMPLETED,
  assignments_completed: PROGRESS.DEFAULT_VALUES.ASSIGNMENTS_COMPLETED,
  total_time_spent_minutes: PROGRESS.DEFAULT_VALUES.TIME_SPENT,
  last_accessed_at: new Date().toISOString(),
  is_course_completed: item.overall_progress_percentage === PROGRESS.COMPLETE_THRESHOLD,
  completion_date: item.overall_progress_percentage === PROGRESS.COMPLETE_THRESHOLD 
    ? new Date().toISOString() 
    : null,
  tenant_id: 1, // TODO: Get from auth context
  is_active: true,
  is_deleted: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 1,
  updated_by: 1,
  created_ip: '127.0.0.1',
  updated_ip: '127.0.0.1',
});

/**
 * Batch create progress data from enrollments
 */
export const createProgressBatch = (items: EnrollmentItem[]): StudentCourseProgress[] => {
  const startTime = performance.now();
  const progress = items.map(createProgressFromEnrollment);
  logPerformance('Progress data creation', startTime, items.length);
  return progress;
};

/**
 * Create transformation context for efficient data processing
 */
export const createTransformationContext = (
  enrollments: EnrollmentItem[]
): CourseTransformationContext => {
  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id));
  const progressMap = new Map(
    enrollments.map(e => [e.course_id, createProgressFromEnrollment(e)])
  );

  return {
    enrolledCourseIds,
    progressMap,
  };
};
