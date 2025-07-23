/**
 * @file services/index.ts
 * @description Barrel file for all service exports
 */

// Export auth service (already exists)
export { AuthService } from './authService';

// Export course service
export { 
  courseService, 
  CourseService,
  type CourseDiscoveryItem,
  type CourseBasicDetails,
  type CourseModule,
  type CourseTopic,
  type CourseVideo,
  type VideoDetails,
  type CourseDiscoveryParams,
  type CourseModulesParams,
  type ModuleTopicsParams,
  type TopicVideosParams
} from './courseService';

// Export enrollment service
export { 
  enrollmentService, 
  EnrollmentService,
  type EnrollmentItem,
  type EnrollmentParams
} from './enrollmentService';

// Export program service
export { 
  programService, 
  ProgramService,
  type Program,
  type Specialization,
  type ProgramParams,
  type SpecializationParams
} from './programService';
