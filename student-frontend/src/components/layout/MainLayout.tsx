
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideNavBar from './SideNavBar';
import Header from './Header';
import { usePageTitle } from '@/hooks/usePageTitle';

interface MainLayoutProps {
  children?: React.ReactNode;
  pageTitle?: string; // Optional override for the page title
}

/**
 * MainLayout - Responsive layout with mobile navigation support
 * 
 * Features:
 * - Desktop: Fixed sidebar + header layout
 * - Mobile: Collapsible drawer navigation with header menu button
 * - Responsive design with proper spacing and mobile-first approach
 * - Dynamic page titles based on current route and data
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  pageTitle // Optional override for the page title
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get dynamic page title based on current route, or use override
  const dynamicPageTitle = usePageTitle();
  const currentPageTitle = pageTitle || dynamicPageTitle;

  // Debug logging
  console.log('MainLayout Debug:', {
    pageTitle,
    dynamicPageTitle,
    currentPageTitle
  });

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen bg-[#F7F3FF] flex flex-col lg:flex-row overflow-hidden">
      {/* Desktop Side Nav Bar - Hidden on mobile */}
      <SideNavBar 
        isOpen={isMobileMenuOpen} 
        onClose={handleMobileMenuClose} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <Header 
          heading={currentPageTitle}
          onMobileMenuToggle={handleMobileMenuToggle}
        />
        
        {/* Main Content */}
        <main className="flex-1 w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
