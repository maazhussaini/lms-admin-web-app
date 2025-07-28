import React from 'react';
import { Outlet } from 'react-router-dom';
import { StudentGuard } from './guards';
import { MainLayout } from '@/components/layout/MainLayout';

/**
 * Protected routes wrapper that provides authentication and layout
 * Uses Outlet to render nested routes
 */
export const ProtectedRoutes: React.FC = () => {
  return (
    <StudentGuard>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </StudentGuard>
  );
};