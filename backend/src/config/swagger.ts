/**
 * @file config/swagger.ts
 * @description Swagger/OpenAPI configuration for API documentation.
 */

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './environment.js';

// Get directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Learning Management System API',
    version: '1.0.0',
    description: 'RESTful API and WebSocket interface for the Learning Management System',
    license: {
      name: 'Private',
      url: 'https://example.com/license',
    },
    contact: {
      name: 'API Support',
      url: 'https://example.com/support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}${env.API_BASE_URL}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          statusCode: {
            type: 'integer',
            example: 400,
          },
          message: {
            type: 'string',
            example: 'Validation failed',
          },
          errorCode: {
            type: 'string',
            example: 'VALIDATION_ERROR',
          },
          details: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            example: {
              email: ['Must be a valid email address'],
            },
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-06-04T12:00:00.000Z',
          },
          correlationId: {
            type: 'string',
            example: '550e8400-e29b-41d4-a716-446655440000',
          },
          path: {
            type: 'string',
            example: '/api/v1/auth/login',
          },
        },
      },
      PaginationResponse: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            example: 1,
          },
          limit: {
            type: 'integer',
            example: 10,
          },
          total: {
            type: 'integer',
            example: 50,
          },
          totalPages: {
            type: 'integer',
            example: 5,
          },
          hasNext: {
            type: 'boolean',
            example: true,
          },
          hasPrev: {
            type: 'boolean',
            example: false,
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication information is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Insufficient permissions to access the resource',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication and authorization operations',
    },
    {
      name: 'Users',
      description: 'User management operations',
    },
    {
      name: 'Tenants',
      description: 'Tenant management operations',
    },
    {
      name: 'Courses',
      description: 'Course management operations',
    },
    {
      name: 'Students',
      description: 'Student management operations',
    },
    {
      name: 'Teachers',
      description: 'Teacher management operations',
    },
    {
      name: 'Enrollments',
      description: 'Enrollment management operations',
    },
    {
      name: 'Quizzes',
      description: 'Quiz management operations',
    },
    {
      name: 'Assignments',
      description: 'Assignment management operations',
    },
    {
      name: 'Notifications',
      description: 'Notification management operations',
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: [
    path.join(__dirname, '../api/v1/routes/*.ts'),
    path.join(__dirname, '../dtos/*.ts'),
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

/**
 * Setup Swagger documentation for Express application
 * @param app Express application instance
 */
export const setupSwagger = (app: Express): void => {
  // Serve swagger docs
  app.use(
    `${env.API_BASE_URL}/docs`,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
    })
  );

  // Serve swagger spec as JSON
  app.get(`${env.API_BASE_URL}/docs.json`, (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

export default setupSwagger;
