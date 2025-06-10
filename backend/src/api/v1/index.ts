/**
 * @file api/v1/index.ts
 * @description Main router for API v1.
 */

import { Router } from 'express';

// Import route modules
import authRoutes from './routes/auth.routes.js';
import studentAuthRoutes from './routes/student/auth.routes.js';
import teacherAuthRoutes from './routes/teacher/auth.routes.js';
import systemUserRoutes from './routes/system-user.routes.js';
import programRoutes from './routes/program.routes';
import tenantRoutes from './routes/tenant.routes.js';
import clientRoutes from './routes/client.routes.js';

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

export default router;
