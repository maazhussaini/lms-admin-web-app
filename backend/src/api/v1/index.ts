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
import moduleTopicRoutes from './routes/module-topic.routes';
import tenantRoutes from './routes/tenant.routes';
import clientRoutes from './routes/client.routes';
import studentRoutes from './routes/student.routes';
import studentProfileRoutes from './routes/student-profile.routes';
import teacherRoutes from './routes/teacher.routes';
import videoRoutes from './routes/video.routes';
import instituteRoutes from './routes/institute.routes';
import geographicRoutes from './routes/geographic.routes';

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
        '/api/v1/specializations',
        '/api/v1/courses',
        '/api/v1/modules',
        '/api/v1/topics',
        '/api/v1/videos',
        '/api/v1/video',
        '/api/v1/students',
        '/api/v1/student',
        '/api/v1/teachers',
        '/api/v1/institutes',
        '/api/v1/countries',
        '/api/v1/states',
        '/api/v1/cities',
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
router.use('/specializations', specializationRoutes);
router.use('/courses', courseRoutes);
router.use('/', moduleTopicRoutes);
router.use('/video', videoRoutes);
router.use('/students', studentRoutes);
router.use('/student', studentProfileRoutes);
router.use('/teachers', teacherRoutes);
router.use('/institutes', instituteRoutes);
router.use('/', geographicRoutes); // Geographic routes (countries, states, cities)

export default router;
