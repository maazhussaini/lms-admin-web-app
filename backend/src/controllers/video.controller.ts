/**
 * @file controllers/video.controller.ts
 * @description Controller for video-related operations including Bunny.net token generation
 */

import { createRouteHandler, AuthenticatedRequest } from '@/utils/async-handler.utils';
import { BadRequestError } from '@/utils/api-error.utils';
import VideoService from '@/services/video.service';
import { BunnyEmbedTokenRequestDto } from '@/dtos/video/bunny-embed-token.dto';
import logger from '@/config/logger';

/**
 * Video controller class handling video-related HTTP requests
 * Contains static methods for handling video operations
 */
export class VideoController {
  /**
   * Generate Bunny embed token for secure video streaming
   * @route GET /api/v1/video/bunny/token
   * @access Private (Students)
   * @query video_id - Bunny video ID
   * @query expires - Token expiration Unix timestamp (optional, defaults to 1 hour from now)
   */
  static generateBunnyEmbedTokenHandler = createRouteHandler(
    async (req: AuthenticatedRequest) => {
      // Extract validated query parameters
      const { video_id, expires } = req.query;

      // Validate required parameters
      if (!video_id) {
        throw new BadRequestError(
          'Missing required parameter: video_id', 
          'MISSING_VIDEO_ID'
        );
      }

      // Use provided expiration or default to 1 hour from now
      const expirationTime = expires ? 
        parseInt(expires as string, 10) : 
        Math.floor(Date.now() / 1000) + 3600;

      // Validate that expiration is in the future
      const currentTime = Math.floor(Date.now() / 1000);
      if (expirationTime <= currentTime) {
        throw new BadRequestError(
          'Expiration time must be in the future', 
          'INVALID_EXPIRATION'
        );
      }

      const requestData: BunnyEmbedTokenRequestDto = {
        videoId: video_id as string,
        expires: expirationTime
      };

      logger.debug('Generating Bunny embed token', {
        videoId: requestData.videoId,
        expires: requestData.expires,
        currentTime,
        userId: req.user?.id,
        tenantId: req.user?.tenantId,
        requestId: req.id
      });

      // Call service to generate token
      const tokenResponse = await VideoService.generateBunnyEmbedToken(
        requestData,
        req.user
      );

      logger.info('Bunny embed token generated successfully', {
        videoId: requestData.videoId,
        expires: requestData.expires,
        userId: req.user?.id,
        requestId: req.id
      });

      return tokenResponse;
    },
    {
      message: 'Embed token generated successfully',
      statusCode: 200
    }
  );
}

export default VideoController;
