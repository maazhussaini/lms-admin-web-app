/**
 * @file utils/bunny-video.utils.ts
 * @description Utilities for Bunny.net video streaming integration.
 */

import crypto from 'crypto';
import env from '@/config/environment.js';
import { InternalServerError } from './api-error.utils.js';
import logger from '@/config/logger.js';

/**
 * Generate a secure Bunny.net video token for streaming
 * @param videoId The ID of the video
 * @param userId The ID of the user accessing the video
 * @param tenantId The ID of the tenant
 * @param expirationMinutes Token validity time in minutes (default: 60 minutes)
 * @returns Secure token for video streaming
 */
export const generateVideoAccessToken = (
  videoId: string,
  userId: number,
  tenantId: number,
  expirationMinutes = 60
): string => {
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
  };
  
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
};

/**
 * Upload a video to Bunny.net
 * @param filePath Local path to the video file
 * @param title Video title
 * @param tenantId Tenant ID for organization
 * @param metadata Additional metadata for the video
 * @returns Promise resolving to the uploaded video details
 */
export const uploadVideoToBunny = async (
  filePath: string,
  title: string,
  tenantId: number,
  metadata: Record<string, any> = {}
): Promise<any> => {
  try {
    // Implementation would require file streaming to Bunny.net API
    // This is a placeholder for the actual implementation
    
    logger.info(`Uploading video to Bunny.net: ${title}`, { tenantId });
    
    // Simulate API call
    // In a real implementation, this would upload the file and return the response
    
    return {
      id: `bunny-${Date.now()}`,
      title,
      status: 'uploaded',
      url: `https://${env.BUNNY_PULL_ZONE_URL}/videos/${Date.now()}`,
      tenantId,
      metadata
    };
  } catch (error) {
    logger.error('Error uploading video to Bunny.net:', error);
    throw new InternalServerError('Failed to upload video to streaming service');
  }
};

/**
 * Get a video by ID from Bunny.net
 * @param videoId ID of the video to retrieve
 * @returns Promise resolving to the video details
 */
export const getVideoFromBunny = async (videoId: string): Promise<any> => {
  try {
    // API endpoint
    const url = `https://video.bunnycdn.com/library/${env.BUNNY_STORAGE_ZONE_NAME}/videos/${videoId}`;
    
    // Make API request
    const response = await fetch(url, {
      headers: {
        'AccessKey': env.BUNNY_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Bunny.net API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    logger.error(`Error retrieving video ${videoId} from Bunny.net:`, error);
    throw new InternalServerError('Failed to retrieve video from streaming service');
  }
};

/**
 * Delete a video from Bunny.net
 * @param videoId ID of the video to delete
 * @returns Promise resolving to true if deletion was successful
 */
export const deleteVideoFromBunny = async (videoId: string): Promise<boolean> => {
  try {
    // API endpoint
    const url = `https://video.bunnycdn.com/library/${env.BUNNY_STORAGE_ZONE_NAME}/videos/${videoId}`;
    
    // Make API request
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'AccessKey': env.BUNNY_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Bunny.net API error: ${response.status} ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Error deleting video ${videoId} from Bunny.net:`, error);
    throw new InternalServerError('Failed to delete video from streaming service');
  }
};
