import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

/**
 * Hook to determine the current page title based on route
 * 
 * Returns specific page titles for different routes:
 * - "Courses" for courses list page
 * - "Course Details" for course details and video player pages
 * - Static titles for other pages
 */
export const usePageTitle = (): string => {
  const location = useLocation();
  const params = useParams<{
    courseId?: string;
    moduleId?: string;
    topicId?: string;
    videoId?: string;
    noticeId?: string;
  }>();

  const pageTitle = useMemo(() => {
    const path = location.pathname;

    // Handle video player page - always use "Course Details"
    if (path.includes('/videos/') && params.videoId) {
      return 'Course Details';
    }

    // Handle course details pages - always use "Course Details"
    if (path.includes('/courses/') && params.courseId) {
      return 'Course Details';
    }

    // Handle static routes
    if (path === '/courses' || path === '/') {
      return 'Courses';
    }

    if (path === '/dashboard') {
      return 'Dashboard';
    }

    if (path === '/profile') {
      return 'Profile';
    }

    if (path === '/settings') {
      return 'Settings';
    }

    if (path === '/notifications') {
      return 'Notifications';
    }

    // Handle notice board pages
    if (path === '/notices' || path.includes('/notices/')) {
      return 'Notice Board';
    }

    // Default fallback
    return 'LMS Student';
  }, [
    location.pathname,
    params.courseId,
    params.videoId
  ]);

  return pageTitle;
};
