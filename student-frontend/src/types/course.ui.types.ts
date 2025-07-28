/**
 * @file types/course.ui.types.ts
 * @description Shared UI types for course-related components
 * Eliminates type duplication across components
 */

import type { StudentCourseProgress } from '@shared/types/course.types';
import type { Program, Specialization } from '@/services';

/**
 * Extended course type for UI display components
 * Unified type used across CourseCard, CourseCardGrid, and MyCoursesPage
 */
export interface ExtendedCourse {
  course_id: number;
  course_name: string;
  course_description?: string;
  main_thumbnail_url?: string | null;
  course_total_hours: number | string; // Can be number or string like "24 hrs"
  teacher_name?: string;
  teacher_qualification?: string | null;
  purchase_status?: string; // From API: "Purchased", "Buy: $59.99", etc.
  is_purchased?: boolean;
  is_free?: boolean; // From API response
  program_name?: string;
  profile_picture_url?: string | null;
  start_date?: string;
  end_date?: string;
  course_type?: 'FREE' | 'PAID' | 'PURCHASED'; // Optional since API might not have this
  course_price?: number; // Optional since API might not have this
  specialization_id?: number;
  program_id?: number; // From API response
}

/**
 * Course tab types for navigation
 */
export type CourseTab = 'all' | 'enrolled' | 'unenrolled';

/**
 * Course data with associated progress information
 */
export interface CourseWithProgress {
  course: ExtendedCourse;
  progress?: StudentCourseProgress;
}

/**
 * Course counts for tab display
 */
export interface CourseCounts {
  all: number;
  enrolled: number;
  unenrolled: number;
}

/**
 * Filter state for course discovery
 * Uses full Program and Specialization types for compatibility with UI components
 */
export interface CourseFilterState {
  searchQuery: string;
  selectedProgram: Program | null;
  selectedSpecialization: Specialization | null;
  selectedCourseType: 'all' | 'free' | 'paid' | 'purchased';
}

/**
 * Course transformation context for data conversion
 */
export interface CourseTransformationContext {
  enrolledCourseIds: Set<number>;
  progressMap: Map<number, StudentCourseProgress>;
}
