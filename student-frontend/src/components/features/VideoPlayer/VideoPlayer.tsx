import React from 'react';
import { motion } from 'framer-motion';
import type { CourseVideo } from '@shared/types';

interface VideoPlayerProps {
  /** Video data to play */
  video: CourseVideo;
  /** Additional CSS classes */
  className?: string;
}

/**
 * VideoPlayer - Placeholder container for Bunny Stream embedded player
 * 
 * Features:
 * - Placeholder container for Bunny Stream player
 * - Curved border radius (15px)
 * - Responsive design
 * - Will host embedded Bunny Stream player with its own controls
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  className = ''
}) => {
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
        {/* TODO: Bunny Stream embedded player will be loaded here */}
        {video.video_url ? (
          <iframe
            src={video.video_url}
            className="w-full h-full rounded-[15px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.video_name}
          />
        ) : (
          // Placeholder when no video URL is available
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
