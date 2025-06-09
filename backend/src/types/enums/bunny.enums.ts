/**
 * Bunny.net video processing and upload status
 */
export enum BunnyVideoStatus {
  UPLOADING,
  PROCESSING,
  FINISHED,
  FAILED,
  CANCELLED,
}

/**
 * Bunny.net video quality/resolution options
 */
export enum BunnyVideoQuality {
  AUTO,
  P240,
  P360,
  P480,
  P720,
  P1080,
  P1440,
  P2160,
}

/**
 * DRM provider types supported by Bunny.net
 */
export enum BunnyDrmProvider {
  WIDEVINE,
  PLAYREADY,
  FAIRPLAY,
}

/**
 * Bunny.net webhook event types
 */
export enum BunnyWebhookEvent {
  VIDEO_UPLOADED,
  VIDEO_ENCODED,
  VIDEO_FAILED,
  VIDEO_DELETED,
  PURGE_COMPLETED,
}

/**
 * Bunny.net CDN regions/zones
 */
export enum BunnyCdnRegion {
  GLOBAL,
  US_EAST,
  US_WEST,
  EUROPE,
  ASIA,
  OCEANIA,
}

/**
 * Video encoding preset options
 */
export enum BunnyEncodingPreset {
  FAST,
  BALANCED,
  QUALITY,
  CUSTOM,
}