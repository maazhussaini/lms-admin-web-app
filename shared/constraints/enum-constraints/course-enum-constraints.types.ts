/**
 * @file course-enum-constraints.types.ts
 * @description Course entity enum constraints with consistent naming.
 */

import { EnumConstraint } from '../base-constraint.types';

/**
 * Course entity enum constraints following PostgreSQL naming conventions
 */
export const COURSE_ENUM_CONSTRAINTS: Record<string, EnumConstraint> = {
  // Course status enum
  COURSE_STATUS_ENUM: {
    table: 'courses',
    constraintName: 'chk_course_status_valid',
    column: 'course_status_id',
    enumName: 'CourseStatus',
    enumValues: { 
      DRAFT: 1, 
      PUBLISHED: 2, 
      ARCHIVED: 3, 
      SUSPENDED: 4 
    },
    description: 'Validates course status enumeration values'
  },

  // Video upload status enum
  VIDEO_UPLOAD_STATUS_ENUM: {
    table: 'course_videos',
    constraintName: 'chk_video_upload_status_valid',
    column: 'upload_status',
    enumName: 'VideoUploadStatus',
    enumValues: { 
      PENDING: 1, 
      PROCESSING: 2, 
      COMPLETED: 3, 
      FAILED: 4, 
      CANCELLED: 5 
    },
    description: 'Validates video upload status enumeration values'
  },
};
