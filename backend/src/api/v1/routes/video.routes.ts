/**
 * @file api/v1/routes/video.routes.ts
 * @description Video-related routes including Bunny.net token generation
 */

import { Router } from 'express';
import { VideoController } from '@/controllers/video.controller';
import { authenticate, authorize } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validation.middleware';
import { bunnyEmbedTokenValidation } from '@/dtos/video/bunny-embed-token.dto';
import { UserType } from '@/types/enums.types';
import rateLimit from 'express-rate-limit';
import env from '@/config/environment';

const router = Router();

// Rate limiter for token generation - prevent abuse
const tokenGenerationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 tokens per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many token requests, please try again later',
    errorCode: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  skip: () => env.NODE_ENV === 'development',
});

/**
 * @route GET /api/v1/video/bunny/token
 * @description Generate Bunny embed token for secure video streaming
 * @access Private (Students only)
 * @query videoId - Bunny video ID (required)
 * @query expires - Token expiration timestamp (required)
 * @query libraryId - Bunny library ID (required)
 */
router.get(
  '/bunny/token',
  tokenGenerationRateLimiter,
  authenticate,
  authorize([UserType.STUDENT]),
  validate(bunnyEmbedTokenValidation),
  VideoController.generateBunnyEmbedTokenHandler
);

export default router;
