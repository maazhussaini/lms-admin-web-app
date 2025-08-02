/// <reference types="vite/client" />

interface ImportMetaEnv {
  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT?: string

  // Application Configuration
  readonly VITE_APP_NAME: string
  readonly VITE_USE_MOCKS?: string

  // Development Settings
  readonly VITE_ENABLE_LOGGING?: string
  readonly VITE_ENABLE_DEBUG_PANEL?: string
  readonly VITE_ENABLE_PERFORMANCE_MONITORING?: string

  // Bunny CDN Configuration
  readonly VITE_BUNNY_CDN_ENABLED?: string
  readonly VITE_BUNNY_CDN_BASE_URL?: string
  readonly VITE_BUNNY_STORAGE_ZONE?: string
  readonly VITE_BUNNY_OPTIMIZER_ENABLED?: string

  // Image Optimization
  readonly VITE_DEFAULT_IMAGE_QUALITY?: string
  readonly VITE_DEFAULT_IMAGE_FORMAT?: string
  readonly VITE_ENABLE_IMAGE_PRELOAD?: string
  readonly VITE_LAZY_LOADING_ENABLED?: string

  // Security Configuration
  readonly VITE_TOKEN_ENCRYPTION_ENABLED?: string
  readonly VITE_SESSION_TIMEOUT?: string

  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS?: string
  readonly VITE_ENABLE_CHAT_SUPPORT?: string
  readonly VITE_ENABLE_NOTIFICATIONS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
