/**
 * @file api/v1/index.ts
 * @description Main router for API v1.
 */

import { Router } from 'express';

// Import route modules
import authRoutes from './routes/auth.routes.js';
import studentAuthRoutes from './routes/student/auth.routes.js';
import teacherAuthRoutes from './routes/teacher/auth.routes.js';
// import userRoutes from './routes/user.routes.js';
import programRoutes from './routes/program.routes';
// import courseRoutes from './routes/course.routes.js';
// import tenantRoutes from './routes/tenant.routes.js';
// import studentRoutes from './routes/student.routes.js';
// import teacherRoutes from './routes/teacher.routes.js';
// import enrollmentRoutes from './routes/enrollment.routes.js';
// import quizRoutes from './routes/quiz.routes.js';
// import assignmentRoutes from './routes/assignment.routes.js';
// import notificationRoutes from './routes/notification.routes.js';

// Create router
const router = Router();

// API v1 documentation endpoint
router.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'LMS API v1',
    data: {
      version: 'v1',
      documentation: '/api/v1/docs',
      endpoints: [
        '/api/v1/auth',
        '/api/v1/auth/student',
        '/api/v1/auth/teacher',
        // '/api/v1/users',
        // '/api/v1/tenants',
        '/api/v1/programs',
        // '/api/v1/courses',
        // '/api/v1/students',
        // '/api/v1/teachers',
        // '/api/v1/enrollments',
        // '/api/v1/quizzes',
        // '/api/v1/assignments',
        // '/api/v1/notifications'
      ]
    },
    timestamp: new Date().toISOString(),
  });
});

// Register route modules
router.use('/auth', authRoutes);
router.use('/auth/student', studentAuthRoutes);
router.use('/auth/teacher', teacherAuthRoutes);
// router.use('/users', userRoutes);
// router.use('/tenants', tenantRoutes);
router.use('/programs', programRoutes);
// router.use('/courses', courseRoutes);
// router.use('/students', studentRoutes);
// router.use('/teachers', teacherRoutes);
// router.use('/enrollments', enrollmentRoutes);
// router.use('/quizzes', quizRoutes);
// router.use('/assignments', assignmentRoutes);
// router.use('/notifications', notificationRoutes);

export default router;
