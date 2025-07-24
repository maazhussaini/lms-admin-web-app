import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaExclamationTriangle } from 'react-icons/fa';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/common/Button';
import { 
  VideoPlayer, 
  VideoPlayerHeader, 
  VideoPlayerControls 
} from '@/components/features/VideoPlayer';
import { 
  useCourseBasicDetails, 
  useTopicVideos, 
  useVideoDetails,
  useModuleTopics
} from '@/hooks/useCourse';
import { adaptCourseBasicDetailsToMockFormat } from '@/utils/courseDataAdapter';
import type { CourseVideo } from '@shared/types';
import type { VideoDetails, CourseVideo as ServiceCourseVideo, CourseTopic } from '@/services/courseService';

// Create a mapper to convert VideoDetails to shared CourseVideo format for VideoPlayer
const mapVideoDetailsToCourseVideo = (videoDetails: VideoDetails): CourseVideo => ({
  course_video_id: videoDetails.course_video_id,
  course_id: videoDetails.course_id,
  course_topic_id: videoDetails.course_topic_id,
  bunny_video_id: videoDetails.bunny_video_id,
  video_name: videoDetails.video_name,
  video_url: videoDetails.video_url,
  thumbnail_url: videoDetails.thumbnail_url,
  duration_seconds: videoDetails.duration,
  position: videoDetails.position,
  tenant_id: 0, // Will be set by backend
  is_active: true,
  is_deleted: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 0,
  created_ip: '',
  updated_by: null,
  updated_ip: null
});

// Create a mapper to convert ServiceCourseVideo to shared CourseVideo format
const mapServiceCourseVideoToSharedCourseVideo = (serviceVideo: ServiceCourseVideo): CourseVideo => ({
  course_video_id: serviceVideo.course_video_id,
  course_id: 0, // Not available in service type
  course_topic_id: 0, // Not available in service type
  bunny_video_id: '', // Not available in service type
  video_name: serviceVideo.video_name,
  video_url: '', // Not available in service type
  thumbnail_url: null,
  duration_seconds: serviceVideo.duration_seconds,
  position: serviceVideo.position,
  tenant_id: 0,
  is_active: true,
  is_deleted: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 0,
  created_ip: '',
  updated_by: null,
  updated_ip: null
});

// Simple error display component
const ErrorDisplay: React.FC<{ 
  message?: string; 
  onRetry?: () => void 
}> = ({ message = 'An error occurred', onRetry }) => (
  <div className="min-h-screen bg-page-bg flex items-center justify-center">
    <div className="text-center p-8">
      <FaExclamationTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error</h2>
      <p className="text-neutral-600 mb-4">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      )}
    </div>
  </div>
);

/**
 * VideoPlayerPage - Container component for video player functionality
 * 
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 * 
 * Route: /courses/:courseId/modules/:moduleId/topics/:topicId/videos/:videoId
 * 
 * Features:
 * - Integrates with VideoPlayerHeader, VideoPlayerControls, and VideoPlayer components
 * - Fetches video details and topic videos from API
 * - Provides navigation context to child components
 * - Handles loading states and error scenarios
 * - Supports video navigation between videos in the same topic
 */
export const VideoPlayerPage: React.FC = () => {
  const { courseId, moduleId, topicId, videoId } = useParams<{
    courseId: string;
    moduleId: string;
    topicId: string;
    videoId: string;
  }>();
  const navigate = useNavigate();

  // Convert string params to numbers
  const courseIdNum = courseId ? parseInt(courseId, 10) : 0;
  const moduleIdNum = moduleId ? parseInt(moduleId, 10) : 0;
  const topicIdNum = topicId ? parseInt(topicId, 10) : 0;
  const videoIdNum = videoId ? parseInt(videoId, 10) : 0;

  // API calls
  const { 
    data: courseDetails, 
    loading: courseLoading, 
    error: courseError,
    refetch: refetchCourse
  } = useCourseBasicDetails(courseIdNum);

  const { 
    data: topicVideosResponse, 
    loading: videosLoading, 
    error: videosError,
    refetch: refetchVideos
  } = useTopicVideos(topicIdNum);

  const { 
    data: moduleTopicsResponse, 
    loading: topicsLoading, 
    error: topicsError,
    refetch: refetchTopics
  } = useModuleTopics(moduleIdNum);

  const { 
    data: videoDetails, 
    loading: videoLoading, 
    error: videoError,
    refetch: refetchVideo
  } = useVideoDetails(videoIdNum);

  // Derive data
  const topicVideos: ServiceCourseVideo[] = topicVideosResponse?.items || [];
  const moduleTopics: CourseTopic[] = moduleTopicsResponse?.items || [];
  const currentTopic = moduleTopics.find(topic => topic.course_topic_id === topicIdNum);
  const currentVideo = videoDetails ? mapVideoDetailsToCourseVideo(videoDetails) : null;

  // Find current video index for navigation
  const currentVideoIndex = topicVideos.findIndex(video => video.course_video_id === videoIdNum);
  const hasPrevious = currentVideoIndex > 0;
  const hasNext = currentVideoIndex < topicVideos.length - 1;
  const previousVideo = hasPrevious ? topicVideos[currentVideoIndex - 1] : null;
  const nextVideo = hasNext ? topicVideos[currentVideoIndex + 1] : null;

  // Navigation context for VideoPlayerHeader
  const navigationContext = useMemo(() => {
    if (!courseDetails || !currentVideo) return null;

    const adaptedCourseData = adaptCourseBasicDetailsToMockFormat(courseDetails);
    const currentModule = adaptedCourseData.modules.find(m => m.course_module_id === moduleIdNum);
    const currentTopic = currentModule?.topics.find(t => t.course_topic_id === topicIdNum);

    return {
      courseDetails: adaptedCourseData,
      currentModule,
      currentTopic,
      currentVideo
    };
  }, [courseDetails, currentVideo, moduleIdNum, topicIdNum]);

  // Handle navigation
  const handleBack = () => {
    navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}`);
  };

  const handleFeedback = () => {
    // TODO: Implement feedback functionality
    console.log('Feedback functionality not yet implemented');
  };

  const handlePrevious = () => {
    if (previousVideo) {
      navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}/videos/${previousVideo.course_video_id}`);
    }
  };

  const handleNext = () => {
    if (nextVideo) {
      navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}/videos/${nextVideo.course_video_id}`);
    }
  };

  // Loading state
  const isLoading = courseLoading || videoLoading || videosLoading || topicsLoading;

  // Error state
  const hasError = courseError || videoError || videosError || topicsError;

  // Handle retry
  const handleRetry = () => {
    if (courseError) refetchCourse();
    if (videoError) refetchVideo();
    if (videosError) refetchVideos();
    if (topicsError) refetchTopics();
  };

  // Validation
  useEffect(() => {
    if (!courseId || !moduleId || !topicId || !videoId) {
      navigate('/dashboard');
    }
  }, [courseId, moduleId, topicId, videoId, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-neutral-600">Loading video...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError || !currentVideo || !navigationContext || !videoDetails) {
    return (
      <ErrorDisplay 
        message="Failed to load video content" 
        onRetry={handleRetry}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentVideo.video_name} - {navigationContext.courseDetails.course_name}</title>
        <meta name="description" content={`Watch ${currentVideo.video_name}`} />
      </Helmet>

      <motion.div 
        className="min-h-screen bg-page-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Main Container for all video player components */}
        <div className="container mx-auto px-4 py-6">
          {/* Video Player Header */}
          <VideoPlayerHeader
            navigationContext={navigationContext}
            videoDetails={videoDetails}
            topicName={currentTopic?.course_topic_name || `Topic ${topicId}`}
            onBack={handleBack}
            onFeedback={handleFeedback}
          />

          <div className="overflow-hidden">
            {/* Video Player Component */}
            <VideoPlayer video={currentVideo} />

            {/* Video Controls */}
            <VideoPlayerControls
              currentVideoIndex={currentVideoIndex}
              totalVideos={topicVideos.length}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPrevious={handlePrevious}
              onNext={handleNext}
              previousVideo={previousVideo ? mapServiceCourseVideoToSharedCourseVideo(previousVideo) : null}
              nextVideo={nextVideo ? mapServiceCourseVideoToSharedCourseVideo(nextVideo) : null}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};
