/**
 * Assignment type enumeration
 * @description Types of assignments available
 */
export enum AssignmentType {
  FILE_UPLOAD
}

/**
 * Assignment status enumeration
 * @description Defines the lifecycle status of an assignment
 */
export enum AssignmentStatus {
  DRAFT,
  PUBLISHED,
  GRADING_IN_PROGRESS,
  GRADED,
  ARCHIVED,
}

/**
 * Submission status enumeration
 * @description Status of a student's assignment submission
 */
export enum SubmissionStatus {
  NOT_SUBMITTED,
  SUBMITTED,
  LATE_SUBMISSION,
  GRADED,
  RESUBMITTED,
}

/**
 * Upload status enumeration
 * @description Status of file upload for assignment submissions
 */
export enum UploadStatus {
  PENDING,
  UPLOADING,
  COMPLETED,
  FAILED,
  CANCELLED,
}

/**
 * Reference table enumeration for assignment mappings
 * @description Entities that can have assignments mapped to them
 */
export enum AssignmentReferenceTable {
  COURSE,
  COURSE_MODULE,
  COURSE_TOPIC,
}