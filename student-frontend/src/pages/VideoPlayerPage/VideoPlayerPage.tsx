import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/common/Button';
import { 
  VideoPlayer,
  VideoPlayerHeader,
  VideoPlayerControls
} from '@/components/features/VideoPlayer';
import { CourseDetailsData, getMockCourseDetails } from '@/pages/CourseDetailsPage/mockData';
import type { CourseVideo } from '@shared/types';

/**
 * VideoPlayerPage - Container component for video player functionality
 * 
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 * Handles the complete video viewing experience including:
 * - Video playback with controls
 * - Course/module/topic context
 * - Navigation between videos
 * - User interface matching the LMS design system
 * 
 * Route: /courses/:courseId/modules/:moduleId/topics/:topicId/videos/:videoId
 */
export const VideoPlayerPage: React.FC = () => {
  const { courseId, moduleId, topicId, videoId } = useParams<{
    courseId: string;
    moduleId: string;
    topicId: string;
    videoId: string;
  }>();
  const navigate = useNavigate();

  // For now, disable API calls and use mock data only
  const loading = false;

  // Use mock data for development/demo purposes
  const courseDetails: CourseDetailsData | null = courseId ? getMockCourseDetails(parseInt(courseId)) : null;

  // Find the current video data
  const getCurrentVideoData = (): CourseVideo | null => {
    if (!courseDetails || !moduleId || !topicId || !videoId) return null;
    
    const moduleIdNum = parseInt(moduleId);
    const topicIdNum = parseInt(topicId);
    const videoIdNum = parseInt(videoId);
    
    const currentModule = courseDetails.modules?.find(
      module => module.course_module_id === moduleIdNum
    );
    
    const currentTopic = currentModule?.topics?.find(
      topic => topic.course_topic_id === topicIdNum
    );
    
    const currentVideo = currentTopic?.videos?.find(
      video => video.course_video_id === videoIdNum
    );
    
    return currentVideo || null;
  };

  // Get all videos in the current topic for navigation
  const getAllVideosInTopic = (): CourseVideo[] => {
    if (!courseDetails || !moduleId || !topicId) return [];
    
    const moduleIdNum = parseInt(moduleId);
    const topicIdNum = parseInt(topicId);
    
    const currentModule = courseDetails.modules?.find(
      module => module.course_module_id === moduleIdNum
    );
    
    const currentTopic = currentModule?.topics?.find(
      topic => topic.course_topic_id === topicIdNum
    );
    
    return currentTopic?.videos || [];
  };

  const currentVideo = getCurrentVideoData();
  const allVideos = getAllVideosInTopic();
  const currentVideoIndex = currentVideo 
    ? allVideos.findIndex(video => video.course_video_id === currentVideo.course_video_id)
    : -1;

  // Handle back navigation
  const handleBack = () => {
    navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}`);
  };

  // Handle previous/next video navigation
  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      const previousVideo = allVideos[currentVideoIndex - 1];
      if (previousVideo) {
        navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}/videos/${previousVideo.course_video_id}`);
      }
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < allVideos.length - 1) {
      const nextVideo = allVideos[currentVideoIndex + 1];
      if (nextVideo) {
        navigate(`/courses/${courseId}/modules/${moduleId}/topics/${topicId}/videos/${nextVideo.course_video_id}`);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state - video not found
  if (!currentVideo || !courseDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Video Not Found</h2>
          <p className="text-neutral-600 mb-6">
            The requested video could not be found or you don't have access to it.
          </p>
          <Button
            variant="primary"
            onClick={handleBack}
          >
            Go Back to Topic
          </Button>
        </div>
      </div>
    );
  }

  // Get navigation context for header
  const navigationContext = {
    courseDetails,
    currentModule: courseDetails.modules?.find(m => m.course_module_id === parseInt(moduleId!)),
    currentTopic: courseDetails.modules?.find(m => m.course_module_id === parseInt(moduleId!))
      ?.topics?.find(t => t.course_topic_id === parseInt(topicId!)),
    currentVideo
  };

  // Handle feedback action
  const handleFeedback = () => {
    // TODO: Implement feedback functionality
    console.log('Feedback button clicked');
  };

  return (
    <motion.div 
      className="min-h-screen bg-page-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Video Player Header */}
      <VideoPlayerHeader
        navigationContext={navigationContext}
        onBack={handleBack}
        onFeedback={handleFeedback}
      />

      {/* Main Video Player Area */}
      <div className="w-full">
        <VideoPlayer
          video={currentVideo}
        />
        
        {/* Video Information */}
        {/* <VideoPlayerInfo
          navigationContext={navigationContext}
        /> */}
        
        {/* Navigation Controls - Full Width Container */}
        <div className="w-full">
          <VideoPlayerControls
            currentVideoIndex={currentVideoIndex}
            totalVideos={allVideos.length}
            hasPrevious={currentVideoIndex > 0}
            hasNext={currentVideoIndex < allVideos.length - 1}
            onPrevious={handlePreviousVideo}
            onNext={handleNextVideo}
            previousVideo={currentVideoIndex > 0 ? (allVideos[currentVideoIndex - 1] || null) : null}
            nextVideo={currentVideoIndex < allVideos.length - 1 ? (allVideos[currentVideoIndex + 1] || null) : null}
          />
        </div>
      </div>
    </motion.div>
  );
};
