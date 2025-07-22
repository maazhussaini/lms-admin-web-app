/**
 * @file api/v1/index.ts
 * @description Main router for API v1.
 */

import { Router } from 'express';

// Import route modules
import authRoutes from './routes/auth.routes';
import studentAuthRoutes from './routes/student/auth.routes';
import teacherAuthRoutes from './routes/teacher/auth.routes';
import systemUserRoutes from './routes/system-user.routes';
import programRoutes from './routes/program.routes';
import specializationRoutes from './routes/specialization.routes';
import courseRoutes from './routes/course.routes';
import tenantRoutes from './routes/tenant.routes';
import clientRoutes from './routes/client.routes';
import studentRoutes from './routes/student.routes';
import studentProfileRoutes from './routes/student-profile.routes';

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
        '/api/v1/system-users',
        '/api/v1/tenants',
        '/api/v1/clients',
        '/api/v1/programs',
        '/api/v1/courses',
        '/api/v1/students',
        '/api/v1/student',
        '/api/v1/specializations',
      ]
    },
    timestamp: new Date().toISOString(),
  });
});

// Register route modules
router.use('/auth', authRoutes);
router.use('/auth/student', studentAuthRoutes);
router.use('/auth/teacher', teacherAuthRoutes);
router.use('/system-users', systemUserRoutes);
router.use('/tenants', tenantRoutes);
router.use('/clients', clientRoutes);
router.use('/programs', programRoutes);
router.use('/courses', courseRoutes);
router.use('/specializations', specializationRoutes);
router.use('/students', studentRoutes);
router.use('/student', studentProfileRoutes);

export default router;
