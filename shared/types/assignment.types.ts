import { MultiTenantAuditFields } from './base.types';

/**
 * Assignment type enumeration
 * @description Types of assignments available
 */
export enum AssignmentType {
  FILE_UPLOAD = 'FILE_UPLOAD'
}

/**
 * Assignment status enumeration
 * @description Defines the lifecycle status of an assignment
 */
export enum AssignmentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  GRADING_IN_PROGRESS = 'GRADING_IN_PROGRESS',
  GRADED = 'GRADED',
  ARCHIVED = 'ARCHIVED',
}

/**
 * Submission status enumeration
 * @description Status of a student's assignment submission
 */
export enum SubmissionStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
  LATE_SUBMISSION = 'LATE_SUBMISSION',
  GRADED = 'GRADED',
  RESUBMITTED = 'RESUBMITTED',
}

/**
 * Upload status enumeration
 * @description Status of file upload for assignment submissions
 */
export enum UploadStatus {
  PENDING = 'PENDING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Reference table enumeration for assignment mappings
 * @description Entities that can have assignments mapped to them
 */
export enum AssignmentReferenceTable {
  COURSE = 'COURSE',
  COURSE_MODULE = 'COURSE_MODULE',
  COURSE_TOPIC = 'COURSE_TOPIC',
}

/**
 * Represents an assignment with multi-tenant isolation
 * @description Main assignment entity with comprehensive information
 */
export interface Assignment extends MultiTenantAuditFields {
  assignment_id: number;
  course_id: number; // Foreign key to Course
  teacher_id: number; // Teacher who created/owns the assignment
  assignment_name: string;
  assignment_description?: string | null;
  assignment_type: AssignmentType;
  total_marks: number;
  passing_marks?: number | null;
  due_date: Date | string;
  allow_late_submissions: boolean;
  max_file_size_mb?: number | null;
  allowed_file_types?: string | null; // Comma-separated MIME types
  max_attempts?: number | null;
  status: AssignmentStatus;
  instructions?: string | null;
}

/**
 * Represents assignment mappings with multi-tenant isolation
 * @description Maps assignments to different entities (course, module, topic)
 */
export interface AssignmentMapping extends MultiTenantAuditFields {
  assignment_mapping_id: number;
  assignment_id: number; // Foreign key to Assignment
  reference_table_id: AssignmentReferenceTable;
  reference_id: number; // ID of the referenced entity
  teacher_id: number; // Teacher who created this mapping
}

/**
 * Represents student assignments with multi-tenant isolation
 * @description Student submissions for assignments
 */
export interface StudentAssignment extends MultiTenantAuditFields {
  student_assignment_id: number;
  assignment_id: number; // Foreign key to Assignment
  student_id: number; // Foreign key to Student
  attempt_number: number;
  submission_date?: Date | string | null;
  submission_status: SubmissionStatus;
  grade?: number | null;
  percentage?: number | null;
  feedback?: string | null;
  graded_by?: number | null; // System User or Teacher who graded this assignment
  graded_at?: Date | string | null;
  teacher_notes?: string | null; // Notes from teacher about this submission
  is_late_submission: boolean;
}

/**
 * Represents assignment submission files with multi-tenant isolation
 * @description Files uploaded for assignment submissions
 */
export interface AssignmentSubmissionFile extends MultiTenantAuditFields {
  assignment_submission_file_id: number;
  student_assignment_id: number; // Foreign key to StudentAssignment
  original_file_name: string;
  file_url: string;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  upload_status_id?: UploadStatus;
}

// Type guards for runtime type checking
export const isAssignmentType = (value: any): value is AssignmentType => 
  Object.values(AssignmentType).includes(value);

export const isAssignmentStatus = (value: any): value is AssignmentStatus => 
  Object.values(AssignmentStatus).includes(value);

export const isSubmissionStatus = (value: any): value is SubmissionStatus => 
  Object.values(SubmissionStatus).includes(value);

export const isUploadStatus = (value: any): value is UploadStatus => 
  Object.values(UploadStatus).includes(value);

export const isAssignmentReferenceTable = (value: any): value is AssignmentReferenceTable => 
  Object.values(AssignmentReferenceTable).includes(value);