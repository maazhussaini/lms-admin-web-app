/**
 * @file dtos/video/bunny-embed-token.dto.ts
 * @description Data Transfer Objects for Bunny.net embed token generation
 */

import { query } from 'express-validator';

/**
 * Request DTO for Bunny embed token generation
 */
export interface BunnyEmbedTokenRequestDto {
  videoId: string;
  expires: number;
}

/**
 * Response DTO for Bunny embed token generation
 */
export interface BunnyEmbedTokenResponseDto {
  token: string;
  expires: number;
  videoUrl: string; // The complete iframe URL
}

/**
 * Validation chain for Bunny embed token request
 */
export const bunnyEmbedTokenValidation = [
  query('video_id')
    .notEmpty()
    .withMessage('Video ID is required')
    .isString()
    .withMessage('Video ID must be a string')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Video ID cannot be empty'),
    
  query('expires')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Expiration must be a positive integer (Unix timestamp)')
    .toInt()
];
