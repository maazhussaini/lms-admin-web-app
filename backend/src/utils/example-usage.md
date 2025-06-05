/**
 * @file example-usage.md
 * @description Example usage of the enhanced error handling system
 */

# Error Handling System - Example Usage

## Basic Controller Example

```typescript
// controllers/course.controller.ts
import { Request, Response, NextFunction } from 'express';
import { 
  asyncHandler, 
  createRouteHandler,
  NotFoundError, 
  BadRequestError,
  tryCatch 
} from '@/utils/index.js';
import { CourseService } from '@/services/course.service.js';
import { TApiSuccessResponse } from '@shared/types';

export class CourseController {
  constructor(private courseService = new CourseService()) {}

  /**
   * Get a course by ID
   * Example using asyncHandler
   */
  getCourseById = asyncHandler(async (
    req: Request, 
    res: Response
  ): Promise<void> => {
    const courseId = parseInt(req.params.id, 10);
    const tenantId = res.locals.tenantId;
    
    if (isNaN(courseId)) {
      throw new BadRequestError('Invalid course ID');
    }
    
    const course = await this.courseService.getCourseById(courseId, tenantId);
    
    if (!course) {
      throw new NotFoundError(`Course with ID ${courseId} not found`);
    }
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Course retrieved successfully',
      data: course,
      timestamp: new Date().toISOString(),
      correlationId: req.id
    } as TApiSuccessResponse);
  });
  
  /**
   * Create a new course
   * Example using createRouteHandler
   */
  createCourse = createRouteHandler(
    async (req: Request): Promise<any> => {
      const tenantId = res.locals.tenantId;
      const courseData = req.validatedData;
      
      return await this.courseService.createCourse(courseData, tenantId);
    },
    { 
      statusCode: 201, 
      message: 'Course created successfully' 
    }
  );
  
  /**
   * Update a course
   * Example using tryCatch
   */
  updateCourse = asyncHandler(async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const courseId = parseInt(req.params.id, 10);
    const tenantId = res.locals.tenantId;
    const courseData = req.validatedData;
    
    const course = await tryCatch(
      () => this.courseService.updateCourse(courseId, courseData, tenantId),
      {
        defaultMessage: 'Failed to update course',
        context: { courseId, tenantId }
      }
    );
    
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Course updated successfully',
      data: course,
      timestamp: new Date().toISOString(),
      correlationId: req.id
    });
  });
}
```

## Service Example with Domain-Specific Errors

```typescript
// services/course.service.ts
import { CourseError, NotFoundError, ConflictError } from '@/utils/api-error.utils.js';
import { createErrorMapper, tryCatch } from '@/utils/error-wrapper.utils.js';
import prisma from '@/config/database.js';
import { Course } from '@shared/types';

export class CourseService {
  /**
   * Map specific errors for course operations
   */
  private mapCourseError = createErrorMapper({
    // Map specific error types to custom errors
    'PrismaClientKnownRequestError': (error: Error) => {
      // Check for specific Prisma error codes
      if ((error as any).code === 'P2002') {
        return new ConflictError('A course with this name already exists');
      }
      return new CourseError('Database error in course operation', 500);
    },
    // Map custom error class directly
    'TypeError': CourseError,
    // Map to a custom message
    'RangeError': 'Invalid course parameter range'
  });

  /**
   * Get a course by ID
   */
  async getCourseById(courseId: number, tenantId: number): Promise<Course | null> {
    // Find the course with tenant isolation
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        tenantId,
        deletedAt: null
      }
    });
    
    if (!course) {
      throw new NotFoundError(`Course with ID ${courseId} not found`);
    }
    
    return course;
  }
  
  /**
   * Create a new course with error mapping
   */
  async createCourse(courseData: any, tenantId: number): Promise<Course> {
    try {
      return await prisma.course.create({
        data: {
          ...courseData,
          tenantId
        }
      });
    } catch (error) {
      // Use our error mapper to convert to domain-specific errors
      throw this.mapCourseError(error);
    }
  }
  
  /**
   * Update a course with error handling
   */
  async updateCourse(courseId: number, courseData: any, tenantId: number): Promise<Course> {
    // First check if the course exists
    const existingCourse = await prisma.course.findUnique({
      where: {
        id: courseId,
        tenantId,
        deletedAt: null
      }
    });
    
    if (!existingCourse) {
      throw new NotFoundError(
        `Course with ID ${courseId} not found`,
        'COURSE_NOT_FOUND',
        { context: { courseId, tenantId } }
      );
    }
    
    // If the course is being updated to PUBLISHED, ensure it has all required fields
    if (courseData.status === 'PUBLISHED') {
      if (!existingCourse.description || !existingCourse.imageUrl) {
        throw new CourseError(
          'Course cannot be published without a description and image',
          400,
          'INCOMPLETE_COURSE',
          {
            details: {
              missingFields: [
                !existingCourse.description ? 'description' : '',
                !existingCourse.imageUrl ? 'imageUrl' : '',
              ].filter(Boolean)
            }
          }
        );
      }
    }
    
    // Use tryCatch to simplify error handling
    return await tryCatch(
      () => prisma.course.update({
        where: { id: courseId, tenantId },
        data: courseData
      }),
      {
        defaultMessage: 'Failed to update course',
        context: { courseId, tenantId, updateData: courseData }
      }
    );
  }
}
```

## Error Middleware Usage

```typescript
// app.ts
import express from 'express';
import errorHandler from '@/middleware/error-handler.middleware.js';
import apiRoutes from '@/api/index.js';

const app = express();

// ... other middleware

// API routes
app.use('/api', apiRoutes);

// Error handling middleware - must be after all routes
app.use(errorHandler);

export default app;
```

## Testing Error Handling

```typescript
// tests/unit/error-handling.test.ts
import { 
  ApiError, 
  NotFoundError, 
  BadRequestError,
  wrapError,
  tryCatch
} from '@/utils/index.js';

describe('Error Handling', () => {
  test('ApiError should be created with correct properties', () => {
    const error = new ApiError('Test error', 400, 'TEST_ERROR', {
      details: { field: ['Error message'] },
      isOperational: true,
      context: { testId: 123 }
    });
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe('TEST_ERROR');
    expect(error.details).toEqual({ field: ['Error message'] });
    expect(error.isOperational).toBe(true);
    expect(error.context).toEqual({ testId: 123 });
  });
  
  test('NotFoundError should be a subclass of ApiError', () => {
    const error = new NotFoundError('Resource not found');
    
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Resource not found');
  });
  
  test('wrapError should convert unknown errors to ApiError', () => {
    const originalError = new Error('Original error');
    const wrappedError = wrapError(originalError, { 
      context: { testId: 123 } 
    });
    
    expect(wrappedError).toBeInstanceOf(ApiError);
    expect(wrappedError.cause).toBe(originalError);
    expect(wrappedError.context).toEqual({ testId: 123 });
  });
  
  test('tryCatch should wrap errors in an async function', async () => {
    const throwingFn = async () => {
      throw new Error('Test error');
    };
    
    await expect(tryCatch(throwingFn)).rejects.toBeInstanceOf(ApiError);
    
    const successFn = async () => 'success';
    await expect(tryCatch(successFn)).resolves.toBe('success');
  });
});
```
