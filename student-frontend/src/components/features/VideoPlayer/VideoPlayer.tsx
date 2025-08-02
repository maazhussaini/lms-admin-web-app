import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CourseVideo } from '@shared/types';
import { useBunnyEmbedUrl } from '@/hooks/useBunnyVideo';
import Spinner from '@/components/common/Spinner';

interface VideoPlayerProps {
  /** Video data to play */
  video: CourseVideo;
  /** Additional CSS classes */
  className?: string;
}

/**
 * VideoPlayer - Secure Bunny Stream embedded player with token-based authentication
 * 
 * Features:
 * - Secure video playback using Bunny.net embed tokens
 * - Automatic token generation and management
 * - Curved border radius (15px)
 * - Responsive design
 * - Loading states and error handling
 * - DRM-protected content support
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  className = ''
}) => {
  // Extract video ID from Bunny video data
  const videoId = useMemo(() => {
    // Extract video ID from bunny_video_id field
    const bunnyVideoId = video.bunny_video_id;
    
    if (!bunnyVideoId) {
      return null;
    }

    // If bunny_video_id contains both library and video ID (format: "library_id:video_id")
    if (bunnyVideoId.includes(':')) {
      const [, extractedVideoId] = bunnyVideoId.split(':');
      return extractedVideoId;
    }
    
    // Otherwise, assume the entire value is the video ID
    return bunnyVideoId;
  }, [video.bunny_video_id]);

  // Calculate expiration timestamp (1 hour from now)
  const expirationTimestamp = useMemo(() => {
    return Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  }, []); // Empty dependency array - only calculate once per component mount

  // Generate Bunny.net embed token and URL
  const { 
    embedUrl, 
    loading: tokenLoading, 
    error: tokenError, 
    refetch: retryToken 
  } = useBunnyEmbedUrl(
    videoId || null,
    expirationTimestamp
  );

  // Loading state
  if (tokenLoading) {
    return (
      <motion.div 
        className={`relative w-full bg-black rounded-[15px] overflow-hidden ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div 
          className="w-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-[15px]"
          style={{
            aspectRatio: '16 / 9',
            minHeight: '400px',
            maxHeight: '600px'
          }}
        >
          <div className="text-center text-white">
            <Spinner size="lg" className="mb-4" />
            <h3 className="text-lg font-medium mb-2">Loading Video</h3>
            <p className="text-sm text-neutral-300">Preparing secure video access...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (tokenError || (!embedUrl && !video.video_url)) {
    return (
      <motion.div 
        className={`relative w-full bg-black rounded-[15px] overflow-hidden ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div 
          className="w-full flex items-center justify-center bg-gradient-to-br from-red-900 to-red-800 rounded-[15px]"
          style={{
            aspectRatio: '16 / 9',
            minHeight: '400px',
            maxHeight: '600px'
          }}
        >
          <div className="text-center text-white">
            <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Video Unavailable</h3>
            <p className="text-sm text-neutral-300 mb-4">
              {tokenError?.message || 'Unable to load video content'}
            </p>
            <button
              onClick={retryToken}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={`relative w-full bg-black rounded-[15px] overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Bunny Stream Player Container */}
      <div 
        className="w-full"
        style={{
          aspectRatio: '16 / 9', // Standard video aspect ratio
          minHeight: '400px',
          maxHeight: '600px'
        }}
      >
        {/* Secure Bunny Stream embedded player with token - DRM-safe iframe isolation */}
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            title={video.video_name}
            style={{ margin: 0, padding: 0, border: 'none' }}
          />
        ) : video.video_url ? (
          // Fallback to direct video URL if Bunny token is not available - DRM-safe iframe isolation
          <iframe
            src={video.video_url}
            className="w-full h-full border-0"
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            title={video.video_name}
            style={{ margin: 0, padding: 0, border: 'none' }}
          />
        ) : (
          // Placeholder when no video is available
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-[15px]">
            <div className="text-center text-white">
              <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">{video.video_name}</h3>
              <p className="text-sm text-neutral-300">Video player will load here</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoPlayer;
