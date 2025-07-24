/**
 * @file utils/courseDataAdapter.ts
 * @description Utility functions to adapt API data to component interfaces
 */

import { CourseBasicDetails } from '@/services/courseService';
import { CourseDetailsData } from '@/pages/CourseDetailsPage/mockData';

/**
 * Adapts CourseBasicDetails from API to CourseDetailsData format for component compatibility
 * This is a temporary adapter while we migrate to direct API integration
 * 
 * @param courseBasicDetails - Course basic details from API
 * @returns CourseDetailsData-compatible object with mapped fields
 */
export function adaptCourseBasicDetailsToMockFormat(
  courseBasicDetails: CourseBasicDetails
): CourseDetailsData {
  const adapted = {
    // Direct field mappings
    course_id: courseBasicDetails.course_id,
    course_name: courseBasicDetails.course_name,
    course_description: courseBasicDetails.course_description,
    
    // Mapped instructor data
    instructor: {
      name: courseBasicDetails.teacher_name,
      avatar: courseBasicDetails.profile_picture_url || undefined,
    },
    
    // Progress data - create a minimal progress object
    progress: {
      overall_progress_percentage: courseBasicDetails.overall_progress_percentage,
    },
    
    // Course dates mapped to created/updated at
    created_at: courseBasicDetails.start_date,
    updated_at: courseBasicDetails.end_date,
    
    // Course type determination
    course_type: courseBasicDetails.is_free ? 'FREE' : 
                 courseBasicDetails.is_purchased ? 'PURCHASED' : 'PAID',
    
    // Other available fields
    course_price: courseBasicDetails.is_free ? 0 : 99.99, // Default price
    
    // Fields that require separate API calls
    modules: [], // Will be populated separately
    
    // Required fields with defaults
    tenant_id: 1,
    specialization_id: 1,
    course_total_hours: parseCourseHours(courseBasicDetails.course_total_hours) || 0,
    main_thumbnail_url: null,
    is_active: true,
    is_deleted: false,
    created_by: 1,
    created_ip: '127.0.0.1',
    course_status: 'PUBLIC',
  };
  
  // Use type assertion for temporary compatibility
  return adapted as unknown as CourseDetailsData;
}

/**
 * Parses course total hours string to number
 * Examples: "24 hrs" -> 24, "1.5 hrs" -> 1.5
 * 
 * @param hoursString - Hours string from API
 * @returns Parsed hours as number or undefined if parsing fails
 */
export function parseCourseHours(hoursString: string): number | undefined {
  if (!hoursString) return undefined;
  
  const match = hoursString.match(/^(\d+(?:\.\d+)?)\s*hrs?/i);
  return match && match[1] ? parseFloat(match[1]) : undefined;
}
