/**
 * @file bunny.types.ts
 * @description Comprehensive type definitions for Bunny.net CDN and video streaming platform integration.
 * Includes video management, DRM configuration, analytics, and webhook types.
 */

import { BaseAuditFields } from './base.types';

/**
 * Bunny.net video processing and upload status
 */
export enum BunnyVideoStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Bunny.net video quality/resolution options
 */
export enum BunnyVideoQuality {
  AUTO = 'AUTO',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160',
}

/**
 * DRM provider types supported by Bunny.net
 */
export enum BunnyDrmProvider {
  WIDEVINE = 'WIDEVINE',
  PLAYREADY = 'PLAYREADY',
  FAIRPLAY = 'FAIRPLAY',
}

/**
 * Bunny.net webhook event types
 */
export enum BunnyWebhookEvent {
  VIDEO_UPLOADED = 'VIDEO_UPLOADED',
  VIDEO_ENCODED = 'VIDEO_ENCODED',
  VIDEO_FAILED = 'VIDEO_FAILED',
  VIDEO_DELETED = 'VIDEO_DELETED',
  PURGE_COMPLETED = 'PURGE_COMPLETED',
}

/**
 * Bunny.net CDN regions/zones
 */
export enum BunnyCdnRegion {
  GLOBAL = 'GLOBAL',
  US_EAST = 'US_EAST',
  US_WEST = 'US_WEST',
  EUROPE = 'EUROPE',
  ASIA = 'ASIA',
  OCEANIA = 'OCEANIA',
}

/**
 * Video encoding preset options
 */
export enum BunnyEncodingPreset {
  FAST = 'FAST',
  BALANCED = 'BALANCED',
  QUALITY = 'QUALITY',
  CUSTOM = 'CUSTOM',
}

/**
 * Response from Bunny.net after video upload
 */
export interface BunnyVideoUploadResponse {
  /** Unique video identifier in Bunny.net */
  videoId: string;
  /** Video library ID where the video is stored */
  videoLibraryId: number;
  /** Video title/name */
  title: string;
  /** Video description */
  description?: string | null;
  /** Auto-generated thumbnail URL */
  thumbnailUrl?: string | null;
  /** HLS manifest URL for playback */
  playbackUrl?: string | null;
  /** Direct MP4 URL (if available) */
  mp4Url?: string | null;
  /** Current processing status */
  status: BunnyVideoStatus;
  /** Video duration in seconds */
  duration?: number | null;
  /** Video file size in bytes */
  size?: number | null;
  /** Video width in pixels */
  width?: number | null;
  /** Video height in pixels */
  height?: number | null;
  /** Video framerate */
  framerate?: number | null;
  /** Video bitrate in kbps */
  bitrate?: number | null;
  /** Upload progress percentage (0-100) */
  uploadProgress?: number | null;
  /** Available video qualities/resolutions */
  availableQualities?: BunnyVideoQuality[];
  /** Video creation timestamp */
  createdAt: Date | string;
  /** Last update timestamp */
  updatedAt?: Date | string | null;
  /** Additional metadata */
  metadata?: Record<string, any> | null;
}

/**
 * DRM (Digital Rights Management) configuration for Bunny.net
 */
export interface BunnyDrmConfiguration {
  /** Enable Widevine DRM protection */
  widevineEnabled: boolean;
  /** Enable PlayReady DRM protection */
  playreadyEnabled: boolean;
  /** Enable FairPlay DRM protection */
  fairplayEnabled: boolean;
  /** Enable token-based authentication */
  tokenAuthenticationEnabled: boolean;
  /** Block screen capture and recording */
  blockScreenCapture: boolean;
  /** Allowed domains for video playback */
  allowedDomains?: string[] | null;
  /** Geographic blocking rules (ISO country codes) */
  geoBlockingRules?: string[] | null;
  /** Allowed IP address ranges (CIDR notation) */
  allowedIpRanges?: string[] | null;
  /** Watermark configuration */
  watermarkConfig?: BunnyWatermarkConfig | null;
  /** Token expiration time in seconds */
  tokenExpirationTime?: number | null;
  /** Maximum concurrent streams per user */
  maxConcurrentStreams?: number | null;
  /** Secure playback settings */
  securePlayback?: BunnySecurePlaybackConfig | null;
}

/**
 * Watermark configuration for video content protection
 */
export interface BunnyWatermarkConfig {
  /** Enable watermark overlay */
  enabled: boolean;
  /** Watermark image URL */
  imageUrl?: string | null;
  /** Watermark text content */
  text?: string | null;
  /** Watermark position on video */
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  /** Watermark opacity (0.0 - 1.0) */
  opacity: number;
  /** Watermark size as percentage of video size */
  scale: number;
  /** Watermark margin from edges in pixels */
  margin?: number | null;
}

/**
 * Secure playback configuration
 */
export interface BunnySecurePlaybackConfig {
  /** Enable secure token validation */
  enableSecureToken: boolean;
  /** Referrer validation */
  referrerValidation: boolean;
  /** User agent validation */
  userAgentValidation: boolean;
  /** Session validation */
  sessionValidation: boolean;
  /** Maximum playback sessions per user */
  maxPlaybackSessions?: number | null;
  /** Playback time restrictions */
  timeRestrictions?: BunnyTimeRestriction[] | null;
}

/**
 * Time-based access restrictions
 */
export interface BunnyTimeRestriction {
  /** Start time for access (24-hour format HH:MM) */
  startTime: string;
  /** End time for access (24-hour format HH:MM) */
  endTime: string;
  /** Days of week (0=Sunday, 6=Saturday) */
  daysOfWeek: number[];
  /** Timezone for time restrictions */
  timezone: string;
}

/**
 * Video library configuration in Bunny.net
 */
export interface BunnyVideoLibrary {
  /** Library unique identifier */
  libraryId: number;
  /** Library name */
  name: string;
  /** Library description */
  description?: string | null;
  /** CDN hostname for video delivery */
  cdnHostname: string;
  /** Storage region */
  storageRegion: BunnyCdnRegion;
  /** Replication regions */
  replicationRegions?: BunnyCdnRegion[] | null;
  /** Default DRM configuration */
  drmConfiguration?: BunnyDrmConfiguration | null;
  /** Encoding settings */
  encodingSettings?: BunnyEncodingSettings | null;
  /** Storage usage in bytes */
  storageUsed?: number | null;
  /** Monthly bandwidth usage in bytes */
  bandwidthUsed?: number | null;
  /** Library creation date */
  createdAt: Date | string;
  /** Last update date */
  updatedAt?: Date | string | null;
}

/**
 * Video encoding settings and presets
 */
export interface BunnyEncodingSettings {
  /** Encoding preset */
  preset: BunnyEncodingPreset;
  /** Target video qualities */
  qualities: BunnyVideoQuality[];
  /** Enable audio transcoding */
  enableAudio: boolean;
  /** Audio bitrate in kbps */
  audioBitrate?: number | null;
  /** Custom encoding parameters */
  customParameters?: Record<string, any> | null;
  /** Enable thumbnail generation */
  generateThumbnails: boolean;
  /** Number of thumbnails to generate */
  thumbnailCount?: number | null;
  /** Thumbnail dimensions */
  thumbnailSize?: { width: number; height: number } | null;
}

/**
 * Video analytics data from Bunny.net
 */
export interface BunnyVideoAnalytics {
  /** Video ID */
  videoId: string;
  /** Analytics time period */
  period: {
    startDate: Date | string;
    endDate: Date | string;
  };
  /** Total number of views */
  totalViews: number;
  /** Unique viewers */
  uniqueViewers: number;
  /** Total watch time in seconds */
  totalWatchTime: number;
  /** Average watch time per view */
  averageWatchTime: number;
  /** Completion rate percentage */
  completionRate: number;
  /** Engagement rate percentage */
  engagementRate: number;
  /** Geographic distribution */
  geographicData: BunnyGeographicData[];
  /** Device/platform breakdown */
  deviceData: BunnyDeviceData[];
  /** Quality selection statistics */
  qualityData: BunnyQualityData[];
  /** Referrer statistics */
  referrerData: BunnyReferrerData[];
  /** Bandwidth usage in bytes */
  bandwidthUsed: number;
}

/**
 * Geographic analytics data
 */
export interface BunnyGeographicData {
  /** Country code (ISO 3166-1 alpha-2) */
  countryCode: string;
  /** Country name */
  countryName: string;
  /** Number of views from this country */
  views: number;
  /** Watch time from this country in seconds */
  watchTime: number;
  /** Bandwidth used in bytes */
  bandwidth: number;
}

/**
 * Device/platform analytics data
 */
export interface BunnyDeviceData {
  /** Device type */
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'unknown';
  /** Operating system */
  operatingSystem: string;
  /** Browser name */
  browser?: string | null;
  /** Number of views */
  views: number;
  /** Watch time in seconds */
  watchTime: number;
}

/**
 * Video quality analytics data
 */
export interface BunnyQualityData {
  /** Video quality/resolution */
  quality: BunnyVideoQuality;
  /** Number of views at this quality */
  views: number;
  /** Percentage of total views */
  percentage: number;
  /** Watch time at this quality */
  watchTime: number;
}

/**
 * Referrer analytics data
 */
export interface BunnyReferrerData {
  /** Referrer domain */
  domain: string;
  /** Full referrer URL */
  url?: string | null;
  /** Number of views from this referrer */
  views: number;
  /** Watch time from this referrer */
  watchTime: number;
}

/**
 * Bunny.net webhook payload structure
 */
export interface BunnyWebhookPayload {
  /** Webhook event type */
  event: BunnyWebhookEvent;
  /** Event timestamp */
  timestamp: Date | string;
  /** Video library ID */
  libraryId: number;
  /** Video ID (if applicable) */
  videoId?: string | null;
  /** Event data */
  data: Record<string, any>;
  /** Webhook signature for verification */
  signature?: string | null;
}

/**
 * Token-based authentication configuration
 */
export interface BunnyTokenConfig {
  /** Enable token authentication */
  enabled: boolean;
  /** Token signing key */
  signingKey: string;
  /** Token expiration time in seconds */
  expirationTime: number;
  /** Allowed IP addresses */
  allowedIps?: string[] | null;
  /** Token validation endpoint */
  validationEndpoint?: string | null;
  /** Custom token parameters */
  customParameters?: Record<string, any> | null;
}

/**
 * Video upload request configuration
 */
export interface BunnyVideoUploadRequest {
  /** Video title */
  title: string;
  /** Video description */
  description?: string | null;
  /** Video file or file path */
  file: File | string;
  /** Target library ID */
  libraryId: number;
  /** Encoding settings */
  encodingSettings?: Partial<BunnyEncodingSettings> | null;
  /** DRM configuration */
  drmConfig?: Partial<BunnyDrmConfiguration> | null;
  /** Custom metadata */
  metadata?: Record<string, any> | null;
  /** Upload progress callback */
  onProgress?: (progress: number) => void;
}

/**
 * Video management operations response
 */
export interface BunnyVideoOperationResponse {
  /** Operation success status */
  success: boolean;
  /** Operation message */
  message?: string | null;
  /** Video ID */
  videoId?: string | null;
  /** Operation result data */
  data?: Record<string, any> | null;
  /** Error details (if any) */
  error?: {
    code: string;
    message: string;
    details?: Record<string, any> | null;
  } | null;
}

/**
 * CDN purge request configuration
 */
export interface BunnyCdnPurgeRequest {
  /** URLs to purge */
  urls: string[];
  /** Purge type */
  type: 'url' | 'hostname' | 'tag';
  /** Async purge (non-blocking) */
  async?: boolean;
}

/**
 * CDN purge response
 */
export interface BunnyCdnPurgeResponse {
  /** Purge request ID */
  requestId: string;
  /** Purge status */
  status: 'accepted' | 'completed' | 'failed';
  /** Purged URLs count */
  purgedCount?: number | null;
  /** Error message (if any) */
  error?: string | null;
}

/**
 * Bunny.net API error response
 */
export interface BunnyApiError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** HTTP status code */
  statusCode: number;
  /** Error details */
  details?: Record<string, any> | null;
  /** Request ID for debugging */
  requestId?: string | null;
}

/**
 * Video search and filtering options
 */
export interface BunnyVideoSearchOptions {
  /** Search query */
  query?: string | null;
  /** Filter by status */
  status?: BunnyVideoStatus | null;
  /** Filter by quality */
  quality?: BunnyVideoQuality | null;
  /** Date range filter */
  dateRange?: {
    startDate: Date | string;
    endDate: Date | string;
  } | null;
  /** Pagination */
  pagination?: {
    page: number;
    limit: number;
  } | null;
  /** Sort options */
  sort?: {
    field: 'createdAt' | 'title' | 'duration' | 'size';
    order: 'asc' | 'desc';
  } | null;
}

/**
 * Video search results
 */
export interface BunnyVideoSearchResults {
  /** Found videos */
  videos: BunnyVideoUploadResponse[];
  /** Total count */
  totalCount: number;
  /** Current page */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Results per page */
  perPage: number;
}

/**
 * Bunny.net integration configuration for LMS
 */
export interface BunnyIntegrationConfig {
  /** API key for Bunny.net */
  apiKey: string;
  /** Default video library ID */
  defaultLibraryId: number;
  /** CDN base URL */
  cdnBaseUrl: string;
  /** Default DRM settings */
  defaultDrmConfig: BunnyDrmConfiguration;
  /** Default encoding settings */
  defaultEncodingSettings: BunnyEncodingSettings;
  /** Webhook endpoint URL */
  webhookUrl?: string | null;
  /** Webhook secret for verification */
  webhookSecret?: string | null;
  /** Rate limiting configuration */
  rateLimiting?: {
    requestsPerMinute: number;
    burstLimit: number;
  } | null;
}

/**
 * LMS-specific video entity with Bunny.net integration
 */
export interface LmsBunnyVideo extends BaseAuditFields {
  /** LMS video ID */
  lms_video_id: number;
  /** Bunny.net video ID */
  bunny_video_id: string;
  /** Bunny.net library ID */
  bunny_library_id: number;
  /** Course association */
  course_id: number;
  /** Topic association */
  course_topic_id: number;
  /** Video metadata */
  video_metadata: BunnyVideoUploadResponse;
  /** DRM configuration */
  drm_config?: BunnyDrmConfiguration | null;
  /** Access restrictions */
  access_restrictions?: BunnySecurePlaybackConfig | null;
  /** Analytics summary */
  analytics_summary?: Partial<BunnyVideoAnalytics> | null;
  /** Last sync timestamp with Bunny.net */
  last_synced_at?: Date | string | null;
}