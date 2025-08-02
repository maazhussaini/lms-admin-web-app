/**
 * @file services/video.service.ts
 * @description Service class for video-related operations including Bunny.net integration
 */

import { 
  BunnyEmbedTokenRequestDto, 
  BunnyEmbedTokenResponseDto 
} from '@/dtos/video/bunny-embed-token.dto';
import { generateEmbedViewToken } from '@/utils/bunny-video.utils';
import { BadRequestError, NotFoundError } from '@/utils/api-error.utils';
import { TokenPayload } from '@/utils/jwt.utils';
import { tryCatch } from '@/utils/error-wrapper.utils';
import logger from '@/config/logger';
import env from '@/config/environment';

/**
 * Video service class handling video operations and token generation
 * Implements singleton pattern for consistent instance management
 */
export class VideoService {
  private static instance: VideoService;

  private constructor() {}

  /**
   * Get singleton instance of VideoService
   * @returns VideoService instance
   */
  static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  /**
   * Generate Bunny embed token for secure video access
   * 
   * @param requestData Token generation request parameters
   * @param user Optional authenticated user context
   * @returns Promise resolving to token response with embed URL
   * @throws {BadRequestError} If request parameters are invalid
   * @throws {NotFoundError} If video access is denied
   * @throws {InternalServerError} If token generation fails
   */
  async generateBunnyEmbedToken(
    requestData: BunnyEmbedTokenRequestDto,
    user?: TokenPayload
  ): Promise<BunnyEmbedTokenResponseDto> {
    const { videoId, expires } = requestData;

    return await tryCatch(
      async () => {
        // Optional: Validate video exists and user has access
        if (user) {
          await this.validateVideoAccess(videoId, user);
        }

        // Use library ID from environment configuration
        const libraryId = parseInt(env.BUNNY_LIBRARY_ID, 10);
        
        if (!libraryId || isNaN(libraryId)) {
          throw new BadRequestError('Bunny library configuration is invalid', 'INVALID_LIBRARY_CONFIG');
        }

        // Generate the embed token using utility function
        const token = generateEmbedViewToken(libraryId, videoId, expires);

        // Construct the complete iframe URL for embedding
        const videoUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}/?token=${token}&expires=${expires}`;

        logger.info('Embed token generated successfully', {
          videoId,
          libraryId,
          expires,
          userId: user?.id,
          tenantId: user?.tenantId
        });

        return {
          token,
          expires,
          videoUrl
        };
      },
      {
        context: { 
          action: 'generateBunnyEmbedToken',
          videoId,
          libraryId: env.BUNNY_LIBRARY_ID,
          userId: user?.id,
          tenantId: user?.tenantId
        },
        logError: true
      }
    );
  }

  /**
   * Validate if user has access to the requested video
   * This is a security enhancement to ensure proper access control
   * 
   * @param videoId The video ID to validate access for
   * @param user The authenticated user context
   * @throws {NotFoundError} If video is not found or access is denied
   * @private
   */
  private async validateVideoAccess(videoId: string, user: TokenPayload): Promise<void> {
    try {
      logger.debug('Validating video access', { 
        videoId, 
        userId: user.id,
        tenantId: user.tenantId
      });

      // Optional: Implement video access validation based on your business logic
      // Example: Check if video belongs to user's enrolled courses
      // For now, we'll log the validation attempt
      
      // Future implementation placeholder:
      // const hasAccess = await this.checkVideoAccess(videoId, user);
      // if (!hasAccess) {
      //   throw new NotFoundError('Video not found or access denied', 'VIDEO_ACCESS_DENIED');
      // }

      logger.debug('Video access validation completed', { videoId, userId: user.id });
    } catch (error) {
      logger.warn('Video access validation failed', { 
        videoId, 
        userId: user.id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Re-throw ApiErrors as-is, wrap others
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      
      throw new NotFoundError('Video access validation failed', 'VIDEO_ACCESS_ERROR');
    }
  }
}

// Export singleton instance for convenience
export default VideoService.getInstance();
