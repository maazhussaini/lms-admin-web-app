
import React from 'react';
import { Outlet } from 'react-router-dom';
import SideNavBar from './SideNavBar';
import Header from './Header';

// Main layout with SideNavBar and Header, no Footer
export const MainLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-row">
      {/* Side Nav Bar */}
      <SideNavBar />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header />
        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
