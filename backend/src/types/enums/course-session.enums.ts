/**
 * Course session status enumeration
 * @description Defines the lifecycle status of a course session
 */
export enum CourseSessionStatus {
  DRAFT,
  PUBLISHED,
  EXPIRED,
}

/**
 * Session enrollment status enumeration
 * @description Defines the enrollment status for course session enrollments
 */
export enum SessionEnrollmentStatus {
  ENROLLED,
  DROPPED,
  COMPLETED,
  EXPELLED,
}
