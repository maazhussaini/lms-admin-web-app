/**
 * @file services/videoService.ts
 * @description Service layer for video-related API operations including Bunny.net integration
 */

import { apiClient } from '@/api';

/**
 * Request payload for Bunny.net embed token generation
 */
export interface BunnyEmbedTokenRequest {
  /** Bunny.net video ID */
  video_id: string;
  /** Token expiration time in seconds (optional, defaults to 1 hour) */
  expires?: number;
}

/**
 * Response from Bunny.net embed token generation
 */
export interface BunnyEmbedTokenResponse {
  /** Generated embed token for secure video access */
  token: string;
  /** Token expiration timestamp */
  expires: number;
  /** Complete iframe URL with token and expires for embedding */
  videoUrl: string;
}

/**
 * Configuration for Bunny.net video player
 */
export interface BunnyVideoConfig {
  /** Video ID from video data */
  videoId: string;
  /** Token expiration in seconds (default: 3600 = 1 hour) */
  expires?: number;
}

/**
 * Video service for handling video-related operations
 */
class VideoService {
  /**
   * Generate Bunny.net embed token for secure video access
   * 
   * @param request - Token generation request parameters
   * @returns Promise with embed token and URL
   */
  async generateBunnyEmbedToken(request: BunnyEmbedTokenRequest): Promise<BunnyEmbedTokenResponse> {
    try {
      // Calculate Unix timestamp for expiration (current time + duration in seconds)
      const expirationTimestamp = Math.floor(Date.now() / 1000) + (request.expires || 3600);
      
      const response = await apiClient.get<BunnyEmbedTokenResponse>(
        `/video/bunny/token?video_id=${encodeURIComponent(request.video_id)}&expires=${expirationTimestamp}`
      );
      
      return response;
    } catch (error) {
      console.error('Failed to generate Bunny.net embed token:', error);
      throw error;
    }
  }

  /**
   * Generate Bunny.net embed token with simplified config
   * 
   * @param config - Video configuration
   * @returns Promise with embed token and URL
   */
  async getBunnyEmbedToken(config: BunnyVideoConfig): Promise<BunnyEmbedTokenResponse> {
    return this.generateBunnyEmbedToken({
      video_id: config.videoId,
      expires: config.expires || 3600 // Default 1 hour duration (not timestamp)
    });
  }
}

// Export singleton instance
export const videoService = new VideoService();
export default videoService;
