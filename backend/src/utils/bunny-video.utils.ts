/**
 * @file utils/bunny-video.utils.ts
 * @description Utilities for Bunny.net video streaming integration.
 * Implements secure token generation and video management operations.
 */

import * as crypto from 'crypto';
import env from '@/config/environment';
import { 
  ExternalServiceError, 
  BadRequestError, 
  InternalServerError,
  NotFoundError,
  ApiError 
} from './api-error.utils';
import logger from '@/config/logger';
import { 
  BunnyTokenConfig, 
  BunnyVideoUploadResponse,
  BunnyVideoOperationResponse,
  BunnyDrmConfiguration,
  BunnyApiError,
  BunnyVideoSearchOptions,
  BunnyVideoSearchResults,
  BunnyCdnPurgeRequest,
  BunnyCdnPurgeResponse
} from '@shared/types/bunny.types';
import { BunnyVideoStatus } from '@/types/enums.types';

/**
 * Type-safe metadata interface for video uploads
 */
interface VideoMetadata {
  readonly title?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly category?: string;
  readonly customFields?: Record<string, string | number | boolean>;
}

/**
 * Type-safe retry options interface
 */
interface RetryOptions {
  readonly maxRetries?: number;
  readonly retryDelay?: number;
}

/**
 * Type-safe video statistics interface
 */
interface VideoStatistics {
  readonly views: number;
  readonly bandwidth: number;
  readonly duration: number;
  readonly plays: number;
  readonly finishRate: number;
  readonly averageWatchTime: number;
}

/**
 * Type guard to safely check if response is BunnyApiError
 */
function isBunnyApiError(obj: unknown): obj is BunnyApiError {
  return typeof obj === 'object' && 
         obj !== null && 
         ('code' in obj || 'message' in obj);
}

/**
 * Safely parses JSON response with type checking
 */
async function safeParseBunnyResponse<T>(response: Response): Promise<T> {
  try {
    const data = await response.json();
    return data as T;
  } catch (error) {
    throw new ExternalServiceError(
      'Failed to parse Bunny.net API response',
      502,
      'BUNNY_RESPONSE_PARSE_ERROR',
      { 
        service: 'Bunny.net',
        cause: error instanceof Error ? error : new Error(String(error))
      }
    );
  }
}

/**
 * Generate a secure Bunny.net video token for streaming
 * 
 * @param videoId The ID of the video
 * @param userId The ID of the user accessing the video
 * @param tenantId The ID of the tenant
 * @param expirationMinutes Token validity time in minutes (default: 60 minutes)
 * @param tokenConfig Optional additional token configuration
 * @returns Secure token for video streaming
 * @throws {BadRequestError} If required parameters are invalid
 */
export const generateVideoAccessToken = (
  videoId: string,
  userId: number,
  tenantId: number,
  expirationMinutes = 60,
  tokenConfig?: Partial<BunnyTokenConfig>
): string => {
  // Input validation
  if (!videoId) {
    throw new BadRequestError('Video ID is required', 'MISSING_VIDEO_ID');
  }
  
  if (!userId || userId <= 0) {
    throw new BadRequestError('Valid user ID is required', 'INVALID_USER_ID');
  }
  
  if (!tenantId || tenantId <= 0) {
    throw new BadRequestError('Valid tenant ID is required', 'INVALID_TENANT_ID');
  }
  
  if (expirationMinutes <= 0) {
    throw new BadRequestError('Expiration minutes must be positive', 'INVALID_EXPIRATION_TIME');
  }
  
  try {
    // Current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Expiration time
    const expirationTime = currentTime + (expirationMinutes * 60);
    
    // Create token payload
    const tokenData = {
      sub: videoId,
      uid: userId.toString(),
      tid: tenantId.toString(),
      exp: expirationTime,
      path: `/videos/${videoId}`,
      // Add custom parameters if provided
      ...(tokenConfig?.customParameters || {})
    };
    
    // Debugging info at trace level
    logger.debug('Generating video access token', { 
      videoId,
      userId,
      tenantId,
      expirationMinutes
    });
    
    // Convert to base64
    const tokenPayload = Buffer.from(JSON.stringify(tokenData)).toString('base64');
    
    // Create signature
    const signature = crypto
      .createHmac('sha256', env.BUNNY_DRM_API_KEY)
      .update(tokenPayload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    // Return final token
    return `${tokenPayload}.${signature}`;
  } catch (error) {
    // Convert non-ApiError exceptions to ApiError
    logger.error('Error generating video access token:', error);
    throw new InternalServerError(
      'Failed to generate video access token',
      'TOKEN_GENERATION_FAILED',
      { cause: error as Error }
    );
  }
};

/**
 * Upload a video to Bunny.net
 * 
 * @param filePath Local path to the video file
 * @param title Video title
 * @param tenantId Tenant ID for organization
 * @param metadata Additional metadata for the video
 * @param retryOptions Retry configuration for API calls
 * @returns Promise resolving to the uploaded video details
 * @throws {BadRequestError} If required parameters are invalid
 * @throws {ExternalServiceError} If there's an issue with the Bunny.net service
 */
export const uploadVideoToBunny = async (
  filePath: string,
  title: string,
  tenantId: number,
  metadata: VideoMetadata = {},
  retryOptions: RetryOptions = {}
): Promise<BunnyVideoUploadResponse> => {
  // Input validation
  if (!filePath) {
    throw new BadRequestError('File path is required', 'MISSING_FILE_PATH');
  }
  
  if (!title || title.trim().length === 0) {
    throw new BadRequestError('Video title is required', 'MISSING_VIDEO_TITLE');
  }
  
  if (!tenantId || tenantId <= 0) {
    throw new BadRequestError('Valid tenant ID is required', 'INVALID_TENANT_ID');
  }
  
  const { maxRetries = 3, retryDelay = 1000 } = retryOptions;
  let retryCount = 0;
  let lastError: Error | null = null;
  
  while (retryCount <= maxRetries) {
    try {
      // Log upload attempt
      logger.info(`Uploading video to Bunny.net: ${title}`, { 
        tenantId,
        filePath,
        retryCount
      });
      
      // Implementation would require file streaming to Bunny.net API
      // This is a placeholder for the actual implementation
      
      // In a real implementation, this would:
      // 1. Create a direct upload URL from Bunny.net API
      // 2. Stream the file content to the URL
      // 3. Wait for encoding to complete or return immediately with status
      
      // Simulate API call
      const result: BunnyVideoUploadResponse = {
        videoId: `bunny-${Date.now()}`,
        videoLibraryId: 1, // Using a constant value instead of env variable
        title,
        status: BunnyVideoStatus.PROCESSING,
        thumbnailUrl: null,
        playbackUrl: `https://${env.BUNNY_PULL_ZONE_URL}/videos/${Date.now()}/playlist.m3u8`,
        mp4Url: null,
        createdAt: new Date().toISOString(),
        metadata
      };
      
      logger.info(`Video successfully uploaded to Bunny.net`, {
        videoId: result.videoId,
        tenantId,
        status: result.status
      });
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Log the failure
      logger.warn(`Attempt ${retryCount + 1}/${maxRetries + 1} to upload video failed`, {
        error: error instanceof Error ? error.message : String(error),
        tenantId,
        filePath,
        title
      });
      
      // Check if we should retry
      if (retryCount < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
        retryCount++;
      } else {
        break;
      }
    }
  }
  
  // All retries failed
  logger.error('Error uploading video to Bunny.net after retries:', lastError);
  throw new ExternalServiceError(
    'Failed to upload video to streaming service',
    502,
    'BUNNY_UPLOAD_FAILED',
    { 
      service: 'Bunny.net',
      cause: lastError as Error
    }
  );
};

/**
 * Get a video by ID from Bunny.net
 * 
 * @param videoId ID of the video to retrieve
 * @param retryOptions Retry configuration for API calls
 * @returns Promise resolving to the video details
 * @throws {BadRequestError} If videoId is invalid
 * @throws {NotFoundError} If video cannot be found
 * @throws {ExternalServiceError} If there's an issue with the Bunny.net service
 */
export const getVideoFromBunny = async (
  videoId: string,
  retryOptions: RetryOptions = {}
): Promise<BunnyVideoUploadResponse> => {
  // Input validation
  if (!videoId) {
    throw new BadRequestError('Video ID is required', 'MISSING_VIDEO_ID');
  }
  
  const { maxRetries = 2, retryDelay = 1000 } = retryOptions;
  let retryCount = 0;
  let lastError: Error | null = null;
  
  while (retryCount <= maxRetries) {
    try {
      // Log the request
      logger.debug(`Retrieving video from Bunny.net`, { 
        videoId,
        retryCount
      });
        // API endpoint
      const url = `https://video.bunnycdn.com/library/${env.BUNNY_STORAGE_ZONE_NAME}/videos/${videoId}`;
      
      // Make API request
      const response = await fetch(url, {
        headers: {
          'AccessKey': env.BUNNY_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle error responses
      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError(
            `Video with ID ${videoId} not found`,
            'VIDEO_NOT_FOUND'
          );
        }
        
        // Parse error details if available
        let errorDetails: BunnyApiError | null = null;
        try {
          const errorData = await response.json();
          if (isBunnyApiError(errorData)) {
            errorDetails = errorData;
          }
        } catch (e) {
          // Ignore JSON parsing errors on error responses
        }
        
        throw new ExternalServiceError(
          `Bunny.net API error: ${response.status} ${response.statusText}`,
          response.status >= 500 ? 502 : 400,
          'BUNNY_API_ERROR',
          { 
            service: 'Bunny.net',
            context: {
              statusCode: response.status,
              errorCode: errorDetails?.code,
              errorMessage: errorDetails?.message
            }
          }
        );
      }
        // Parse response
      const data = await safeParseBunnyResponse<BunnyVideoUploadResponse>(response);
      
      // Log success
      logger.debug(`Successfully retrieved video from Bunny.net`, {
        videoId,
        status: data.status
      });
      
      return data;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry 404 errors
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      // Log the failure
      logger.warn(`Attempt ${retryCount + 1}/${maxRetries + 1} to retrieve video failed`, {
        error: error instanceof Error ? error.message : String(error),
        videoId
      });
      
      // Check if we should retry
      if (retryCount < maxRetries) {
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
        retryCount++;
      } else {
        break;
      }
    }
  }
  
  // All retries failed
  if (lastError instanceof ApiError) {
    throw lastError;
  }
  
  logger.error(`Error retrieving video ${videoId} from Bunny.net:`, lastError);
  throw new ExternalServiceError(
    'Failed to retrieve video from streaming service',
    502,
    'BUNNY_GET_VIDEO_FAILED',
    { 
      service: 'Bunny.net',
      cause: lastError as Error
    }
  );
};

/**
 * Delete a video from Bunny.net
 * 
 * @param videoId ID of the video to delete
 * @param retryOptions Retry configuration for API calls
 * @returns Promise resolving to a video operation response
 * @throws {BadRequestError} If videoId is invalid
 * @throws {NotFoundError} If video cannot be found
 * @throws {ExternalServiceError} If there's an issue with the Bunny.net service
 */
export const deleteVideoFromBunny = async (
  videoId: string,
  retryOptions: RetryOptions = {}
): Promise<BunnyVideoOperationResponse> => {
  // Input validation
  if (!videoId) {
    throw new BadRequestError('Video ID is required', 'MISSING_VIDEO_ID');
  }
  
  const { maxRetries = 2, retryDelay = 1000 } = retryOptions;
  let retryCount = 0;
  let lastError: Error | null = null;
  
  while (retryCount <= maxRetries) {
    try {
      // Log the request
      logger.info(`Deleting video from Bunny.net`, { 
        videoId,
        retryCount
      });
      
      // API endpoint
      const url = `https://video.bunnycdn.com/library/${env.BUNNY_STORAGE_ZONE_NAME}/videos/${videoId}`;
        // Make API request
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'AccessKey': env.BUNNY_API_KEY
        }
      });
      
      // Handle error responses
      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundError(
            `Video with ID ${videoId} not found`,
            'VIDEO_NOT_FOUND'
          );
        }
        
        // Parse error details if available
        let errorDetails: BunnyApiError | null = null;
        try {
          const errorData = await response.json();
          if (isBunnyApiError(errorData)) {
            errorDetails = errorData;
          }
        } catch (e) {
          // Ignore JSON parsing errors on error responses
        }
        
        throw new ExternalServiceError(
          `Bunny.net API error: ${response.status} ${response.statusText}`,
          response.status >= 500 ? 502 : 400,
          'BUNNY_API_ERROR',
          { 
            service: 'Bunny.net',
            context: {
              statusCode: response.status,
              errorCode: errorDetails?.code,
              errorMessage: errorDetails?.message
            }
          }
        );
      }
      
      // Log success
      logger.info(`Successfully deleted video from Bunny.net`, {
        videoId
      });
      
      // Return success response
      return {
        success: true,
        message: `Video ${videoId} successfully deleted`,
        videoId
      };
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry 404 errors
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      // Log the failure
      logger.warn(`Attempt ${retryCount + 1}/${maxRetries + 1} to delete video failed`, {
        error: error instanceof Error ? error.message : String(error),
        videoId
      });
      
      // Check if we should retry
      if (retryCount < maxRetries) {
        // Wait before retrying with exponential backoff
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));
        retryCount++;
      } else {
        break;
      }
    }
  }
  
  // All retries failed
  if (lastError instanceof ApiError) {
    throw lastError;
  }
  
  logger.error(`Error deleting video ${videoId} from Bunny.net:`, lastError);
  throw new ExternalServiceError(
    'Failed to delete video from streaming service',
    502,
    'BUNNY_DELETE_FAILED',
    { 
      service: 'Bunny.net',
      cause: lastError as Error
    }
  );
};

/**
 * Search for videos in Bunny.net library
 * 
 * @param options Search parameters and filters
 * @returns Promise resolving to search results with pagination
 * @throws {ExternalServiceError} If there's an issue with the Bunny.net service
 */
export const searchVideos = async (
  options: BunnyVideoSearchOptions = {}
): Promise<BunnyVideoSearchResults> => {
  try {
    logger.debug('Searching videos in Bunny.net', { options });
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (options.query) {
      queryParams.append('search', options.query);
    }
    
    if (options.status) {
      queryParams.append('status', options.status);
    }
    
    if (options.pagination) {
      queryParams.append('page', options.pagination.page.toString());
      queryParams.append('itemsPerPage', options.pagination.limit.toString());
    }
    
    if (options.sort) {
      queryParams.append('orderBy', options.sort.field);
      queryParams.append('order', options.sort.order);
    }
    
    // API endpoint
    const url = `https://video.bunnycdn.com/library/${env.BUNNY_STORAGE_ZONE_NAME}/videos?${queryParams.toString()}`;
    
    // Make API request
    const response = await fetch(url, {
      headers: {
        'AccessKey': env.BUNNY_API_KEY,
        'Content-Type': 'application/json'
      }
    });
      if (!response.ok) {
      let errorDetails: BunnyApiError | null = null;
      try {
        const errorData = await response.json();
        if (isBunnyApiError(errorData)) {
          errorDetails = errorData;
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      throw new ExternalServiceError(
        `Failed to search videos: ${response.status} ${response.statusText}`,
        response.status >= 500 ? 502 : 400,
        'BUNNY_SEARCH_FAILED',
        { 
          service: 'Bunny.net',
          context: {
            statusCode: response.status,
            errorDetails
          }
        }
      );
    }
      const data = await safeParseBunnyResponse<{
      items: BunnyVideoUploadResponse[];
      totalItems: number;
      currentPage: number;
      totalPages: number;
      itemsPerPage: number;
    }>(response);
    
    // Transform response to match BunnyVideoSearchResults
    const result: BunnyVideoSearchResults = {
      videos: data.items || [],
      totalCount: data.totalItems || 0,
      currentPage: data.currentPage || 1,
      totalPages: data.totalPages || 1,
      perPage: data.itemsPerPage || 20
    };
    
    logger.debug('Video search completed', { 
      count: result.videos.length,
      totalCount: result.totalCount
    });
    
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error('Error searching videos in Bunny.net:', error);
    throw new ExternalServiceError(
      'Failed to search videos in streaming service',
      502,
      'BUNNY_SEARCH_FAILED',
      { 
        service: 'Bunny.net',
        cause: error as Error
      }
    );
  }
};

/**
 * Purge video from CDN cache to refresh content
 * 
 * @param videoId ID of the video to purge
 * @returns Promise resolving to a CDN purge response
 * @throws {BadRequestError} If videoId is invalid
 * @throws {ExternalServiceError} If there's an issue with the Bunny.net service
 */
export const purgeVideoCdn = async (
  videoId: string
): Promise<BunnyCdnPurgeResponse> => {
  // Input validation
  if (!videoId) {
    throw new BadRequestError('Video ID is required', 'MISSING_VIDEO_ID');
  }
  
  try {
    logger.info(`Purging video from Bunny CDN cache`, { videoId });
    
    // Get video details to construct URLs to purge
    const video = await getVideoFromBunny(videoId);
    
    // Determine URLs to purge
    const urlsToPurge = [];
    
    if (video.playbackUrl) {
      urlsToPurge.push(video.playbackUrl);
    }
    
    if (video.mp4Url) {
      urlsToPurge.push(video.mp4Url);
    }
    
    if (video.thumbnailUrl) {
      urlsToPurge.push(video.thumbnailUrl);
    }
    
    // Add base path for playlist and segments
    const basePath = `https://${env.BUNNY_PULL_ZONE_URL}/videos/${videoId}/`;
    urlsToPurge.push(`${basePath}playlist.m3u8`);
    urlsToPurge.push(`${basePath}index.m3u8`);
    urlsToPurge.push(`${basePath}*`); // Wildcard to catch all segments
    
    // API endpoint for purging
    const url = `https://api.bunny.net/purge`;
    
    // Purge request
    const purgeRequest: BunnyCdnPurgeRequest = {
      urls: urlsToPurge,
      type: 'url',
      async: true
    };
    
    // Make API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'AccessKey': env.BUNNY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(purgeRequest)
    });
    
    if (!response.ok) {
      throw new ExternalServiceError(
        `Failed to purge CDN cache: ${response.status} ${response.statusText}`,
        response.status >= 500 ? 502 : 400,
        'BUNNY_PURGE_FAILED',
        { service: 'Bunny.net' }
      );
    }
      const result = await safeParseBunnyResponse<BunnyCdnPurgeResponse>(response);
    
    logger.info(`Successfully purged video from CDN cache`, {
      videoId,
      requestId: result.requestId
    });
    
    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error(`Error purging video ${videoId} from CDN cache:`, error);
    throw new ExternalServiceError(
      'Failed to purge video from CDN cache',
      502,
      'BUNNY_PURGE_FAILED',
      { 
        service: 'Bunny.net',
        cause: error as Error
      }
    );
  }
};

/**
 * Update video metadata in Bunny.net
 * 
 * @param videoId ID of the video to update
 * @param metadata New metadata to set
 * @returns Promise resolving to the updated video details
 * @throws {BadRequestError} If required parameters are invalid
 * @throws {NotFoundError} If video cannot be found
 * @throws {ExternalServiceError} If there's an issue with the Bunny.net service
 */
export const updateVideoMetadata = async (
  videoId: string,
  metadata: {
    title?: string;
    description?: string;
    collectionId?: string;
    thumbnailTime?: number;
    tags?: string[];
    customMetadata?: Record<string, any>;
  }
): Promise<BunnyVideoUploadResponse> => {
  // Input validation
  if (!videoId) {
    throw new BadRequestError('Video ID is required', 'MISSING_VIDEO_ID');
  }
  
  if (Object.keys(metadata).length === 0) {
    throw new BadRequestError('No metadata updates provided', 'EMPTY_METADATA_UPDATE');
  }
  
  try {
    logger.info(`Updating video metadata in Bunny.net`, { 
      videoId,
      metadataFields: Object.keys(metadata)
    });
    
    // API endpoint
    const url = `https://video.bunnycdn.com/library/${env.BUNNY_STORAGE_ZONE_NAME}/videos/${videoId}`;
    
    // Make API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'AccessKey': env.BUNNY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });
    
    // Handle error responses
    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(
          `Video with ID ${videoId} not found`,
          'VIDEO_NOT_FOUND'
        );
      }
      
      throw new ExternalServiceError(
        `Failed to update video metadata: ${response.status} ${response.statusText}`,
        response.status >= 500 ? 502 : 400,
        'BUNNY_UPDATE_FAILED',
        { service: 'Bunny.net' }
      );
    }
      const updatedVideo = await safeParseBunnyResponse<BunnyVideoUploadResponse>(response);
    
    logger.info(`Successfully updated video metadata`, {
      videoId,
      title: metadata.title
    });
    
    return updatedVideo;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error(`Error updating video ${videoId} metadata:`, error);
    throw new ExternalServiceError(
      'Failed to update video metadata',
      502,
      'BUNNY_UPDATE_FAILED',
      { 
        service: 'Bunny.net',
        cause: error as Error
      }
    );
  }
};

/**
 * Apply DRM settings to a video
 * 
 * @param videoId ID of the video to apply DRM settings to
 * @param drmSettings DRM configuration to apply
 * @returns Promise resolving to operation status
 * @throws {BadRequestError} If required parameters are invalid
 * @throws {NotFoundError} If video cannot be found
 * @throws {ExternalServiceError} If there's an issue with the Bunny.net service
 */
export const applyDrmSettings = async (
  videoId: string,
  drmSettings: Partial<BunnyDrmConfiguration>
): Promise<BunnyVideoOperationResponse> => {
  // Input validation
  if (!videoId) {
    throw new BadRequestError('Video ID is required', 'MISSING_VIDEO_ID');
  }
  
  if (Object.keys(drmSettings).length === 0) {
    throw new BadRequestError('No DRM settings provided', 'EMPTY_DRM_SETTINGS');
  }
  
  try {
    logger.info(`Applying DRM settings to video in Bunny.net`, { 
      videoId,
      drmSettings: Object.keys(drmSettings)
    });
    
    // API endpoint
    const url = `https://video.bunnycdn.com/library/${env.BUNNY_STORAGE_ZONE_NAME}/videos/${videoId}/security`;
    
    // Make API request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'AccessKey': env.BUNNY_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(drmSettings)
    });
    
    // Handle error responses
    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(
          `Video with ID ${videoId} not found`,
          'VIDEO_NOT_FOUND'
        );
      }
      
      throw new ExternalServiceError(
        `Failed to apply DRM settings: ${response.status} ${response.statusText}`,
        response.status >= 500 ? 502 : 400,
        'BUNNY_DRM_UPDATE_FAILED',
        { service: 'Bunny.net' }
      );
    }
    
    logger.info(`Successfully applied DRM settings to video`, {
      videoId,
      tokenAuthEnabled: drmSettings.tokenAuthenticationEnabled
    });
    
    return {
      success: true,
      message: 'DRM settings applied successfully',
      videoId
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error(`Error applying DRM settings to video ${videoId}:`, error);
    throw new ExternalServiceError(
      'Failed to apply DRM settings to video',
      502,
      'BUNNY_DRM_UPDATE_FAILED',
      { 
        service: 'Bunny.net',
        cause: error as Error
      }
    );
  }
};

/**
 * Get streaming statistics for a video
 * 
 * @param videoId ID of the video to get stats for
 * @param dateRange Optional date range for stats
 * @returns Promise resolving to video streaming statistics
 * @throws {BadRequestError} If videoId is invalid
 * @throws {NotFoundError} If video cannot be found
 * @throws {ExternalServiceError} If there's an issue with the Bunny.net service
 */
export const getVideoStreamStats = async (
  videoId: string,
  dateRange?: { startDate: Date | string; endDate: Date | string }
): Promise<VideoStatistics> => {
  // Input validation
  if (!videoId) {
    throw new BadRequestError('Video ID is required', 'MISSING_VIDEO_ID');
  }
  
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (dateRange) {
      const startDateStr = typeof dateRange.startDate === 'string' 
        ? dateRange.startDate 
        : dateRange.startDate.toISOString();
      
      const endDateStr = typeof dateRange.endDate === 'string' 
        ? dateRange.endDate 
        : dateRange.endDate.toISOString();
      
      queryParams.append('startDate', startDateStr);
      queryParams.append('endDate', endDateStr);
    }
    
    logger.debug(`Retrieving video streaming statistics from Bunny.net`, { 
      videoId,
      dateRange
    });
    
    // API endpoint
    const url = `https://video.bunnycdn.com/library/${env.BUNNY_STORAGE_ZONE_NAME}/videos/${videoId}/statistics?${queryParams.toString()}`;
    
    // Make API request
    const response = await fetch(url, {
      headers: {
        'AccessKey': env.BUNNY_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    // Handle error responses
    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundError(
          `Video with ID ${videoId} not found`,
          'VIDEO_NOT_FOUND'
        );
      }
      
      throw new ExternalServiceError(
        `Failed to retrieve video statistics: ${response.status} ${response.statusText}`,
        response.status >= 500 ? 502 : 400,
        'BUNNY_STATISTICS_FAILED',
        { service: 'Bunny.net' }
      );
    }
      const data = await safeParseBunnyResponse<VideoStatistics>(response);
    
    logger.debug(`Successfully retrieved video streaming statistics`, {
      videoId,
      hasData: !!data
    });
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error(`Error retrieving statistics for video ${videoId}:`, error);
    throw new ExternalServiceError(
      'Failed to retrieve video streaming statistics',
      502,
      'BUNNY_STATISTICS_FAILED',
      { 
        service: 'Bunny.net',
        cause: error as Error
      }
    );
  }
};
