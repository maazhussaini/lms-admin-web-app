import { ValidationChain } from 'express-validator';

/**
 * DTO interface for getting course modules
 */
export interface GetCourseModulesDto {
  course_id: number;
}

/**
 * Interface for course module response
 */
export interface CourseModuleResponse {
  course_module_id: number;
  course_module_name: string;
  module_stats: string;
}

/**
 * Express validator rules for getting course modules
 */
export const getCourseModulesValidation: ValidationChain[] = [
  // No additional validation needed - courseId is validated as path parameter in route
];
