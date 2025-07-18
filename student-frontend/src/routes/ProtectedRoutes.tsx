import React from 'react';
import { useLocation } from 'react-router-dom';
import { StudentGuard } from './guards';
import { MainLayout } from '@/components/layout/MainLayout';
import { MyCoursesPage } from '@/pages/MyCoursesPage';

/**
 * Protected routes component that renders the appropriate page based on current path
 * All routes are wrapped with MainLayout and StudentGuard
 */
export const ProtectedRoutes: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Get page title based on current route
  const getPageTitle = (path: string): string => {
    // Handle parameterized routes
    if (path.startsWith('/courses/') && path.includes('/lectures/')) {
      return 'Lecture';
    }
    if (path.startsWith('/courses/') && path !== '/courses') {
      return 'Course Details';
    }

    // Handle exact routes
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/profile':
        return 'Profile';
      case '/settings':
        return 'Settings';
      case '/courses':
        return 'My Courses';
      case '/assignments':
        return 'Assignments';
      case '/quizzes':
        return 'Quizzes';
      case '/grades':
        return 'Grades';
      case '/notifications':
        return 'Notifications';
      default:
        return 'Page Not Found';
    }
  };

  // Route to component mapping
  const renderPage = () => {
    // Handle parameterized routes
    if (currentPath.startsWith('/courses/') && currentPath.includes('/lectures/')) {
      // TODO: Replace with actual LectureViewerPage when implemented
      return null;
    }
    if (currentPath.startsWith('/courses/') && currentPath !== '/courses') {
      // TODO: Replace with actual CourseDetailPage when implemented
      return null;
    }

    // Handle exact routes
    switch (currentPath) {
      case '/dashboard':
        // TODO: Replace with actual DashboardPage when implemented
        return null;
      case '/profile':
        // TODO: Replace with actual ProfilePage when implemented
        return null;
      case '/settings':
        // TODO: Replace with actual SettingsPage when implemented
        return null;
      case '/courses':
        return <MyCoursesPage />;
      case '/assignments':
        // TODO: Replace with actual AssignmentsPage when implemented
        return null;
      case '/quizzes':
        // TODO: Replace with actual QuizzesPage when implemented
        return null;
      case '/grades':
        // TODO: Replace with actual GradesPage when implemented
        return null;
      case '/notifications':
        // TODO: Replace with actual NotificationsPage when implemented
        return null;
      default:
        // TODO: Replace with actual NotFoundPage when implemented
        return null;
    }
  };

  return (
    <StudentGuard>
      <MainLayout pageTitle={getPageTitle(currentPath)}>
        {renderPage()}
      </MainLayout>
    </StudentGuard>
  );
};