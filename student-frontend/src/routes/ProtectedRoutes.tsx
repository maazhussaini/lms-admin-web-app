import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { StudentGuard } from './guards';
import { MainLayout } from '@/components/layout/MainLayout';
import { MyCoursesPage } from '@/pages/MyCoursesPage';
import { CourseDetailsPage } from '@/pages/CourseDetailsPage';
import { VideoPlayerPage } from '@/pages/VideoPlayerPage';

/**
 * Protected routes component that renders the appropriate page based on current path
 * All routes are wrapped with MainLayout and StudentGuard
 */
export const ProtectedRoutes: React.FC = () => {
  return (
    <StudentGuard>
      <MainLayout>
        <Routes>
          <Route path="/courses" element={<MyCoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
          <Route path="/courses/:courseId/modules/:moduleId" element={<CourseDetailsPage />} />
          <Route path="/courses/:courseId/modules/:moduleId/topics/:topicId" element={<CourseDetailsPage />} />
          <Route path="/courses/:courseId/modules/:moduleId/topics/:topicId/videos/:videoId" element={<VideoPlayerPage />} />
          {/* Add other protected routes here as needed */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </MainLayout>
    </StudentGuard>
  );
};