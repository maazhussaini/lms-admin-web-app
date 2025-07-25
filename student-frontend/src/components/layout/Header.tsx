import React from 'react';
import { FiBell, FiMenu } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useApiItem } from '@/hooks/useApi';
import { StudentProfileResponse } from '@/types/student-profile.types';
import { getInstructorAvatarUrl } from '@shared/utils';

interface HeaderProps {
  heading?: string;
  onMobileMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  heading = 'Heading',
  onMobileMenuToggle 
}) => {
  const { isAuthenticated } = useAuth();

  // Fetch student profile data using dedicated API
  const { 
    data: studentProfile, 
    loading: profileLoading, 
    error: profileError 
  } = useApiItem<StudentProfileResponse>('/student/profile', {
    immediate: isAuthenticated // Only fetch immediately when user is authenticated
  });

  // Generate user avatar URL using the utility function
  const userAvatarUrl = studentProfile?.profile_picture_url || 
    (studentProfile?.full_name ? getInstructorAvatarUrl(studentProfile.full_name) : '/default_profile_picture.webp');

  // Use student profile data or provide fallbacks
  const displayName = studentProfile?.full_name || 'Loading...';
  const displayEmail = studentProfile?.primary_email || studentProfile?.username || 'Loading...';

  // Show loading state during initial profile fetch
  if (profileLoading && !studentProfile) {
    return (
      <header className="bg-white px-4 sm:px-8 lg:px-14 py-3 sm:py-4 shadow-none border-none">
        <div className="flex items-center justify-between">
          {/* Left: Mobile Menu + Heading */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Button */}
            {onMobileMenuToggle && (
              <button
                onClick={onMobileMenuToggle}
                className="lg:hidden rounded-2xl bg-primary-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Toggle navigation menu"
              >
                <FiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
              </button>
            )}
            
            {/* Heading */}
            <h1 className="text-lg sm:text-xl lg:text-[2rem] font-semibold text-primary-800 font-heading leading-none truncate">
              {heading}
            </h1>
          </div>

          {/* Right: Loading state */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            <div className="flex gap-1 sm:gap-2">
              <button className="rounded-2xl bg-primary-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 relative">
                <FiBell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-neutral-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="hidden sm:flex flex-col gap-1">
                <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Show error fallback if profile fails to load
  if (profileError && !studentProfile) {
    return (
      <header className="bg-white px-4 sm:px-8 lg:px-14 py-3 sm:py-4 shadow-none border-none">
        <div className="flex items-center justify-between">
          {/* Left: Mobile Menu + Heading */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Menu Button */}
            {onMobileMenuToggle && (
              <button
                onClick={onMobileMenuToggle}
                className="lg:hidden rounded-2xl bg-primary-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Toggle navigation menu"
              >
                <FiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
              </button>
            )}
            
            {/* Heading */}
            <h1 className="text-lg sm:text-xl lg:text-[2rem] font-semibold text-primary-800 font-heading leading-none truncate">
              {heading}
            </h1>
          </div>

          {/* Right: Error state */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            <div className="flex gap-1 sm:gap-2">
              <button className="rounded-2xl bg-primary-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 relative">
                <FiBell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-neutral-500" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/default_profile_picture.webp"
                alt="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white shadow"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-sm lg:text-lg font-semibold text-neutral-600 leading-tight font-heading truncate max-w-[120px] lg:max-w-none">
                  Profile Error
                </span>
                <span className="text-xs lg:text-sm text-neutral-400 leading-tight truncate max-w-[120px] lg:max-w-none">
                  Unable to load
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="bg-white px-4 sm:px-8 lg:px-14 py-3 sm:py-4 shadow-none border-none">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Menu + Heading */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Menu Button */}
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden rounded-2xl bg-primary-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle navigation menu"
            >
              <FiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-600" />
            </button>
          )}
          
          {/* Heading */}
          <h1 className="text-lg sm:text-xl lg:text-[2rem] font-semibold text-primary-800 font-heading leading-none truncate">
            {heading}
          </h1>
        </div>

        {/* Right: Icons and User */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          {/* Action Icons */}
          <div className="flex gap-1 sm:gap-2">
            <button className="rounded-2xl bg-primary-50 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-500 relative">
              <FiBell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-neutral-500" />
              {/* Notification indicator */}
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src={userAvatarUrl}
              alt={displayName}
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white shadow"
            />
            {/* User Info - Hidden on mobile */}
            <div className="hidden sm:flex flex-col">
              <span className="text-sm lg:text-lg font-semibold text-neutral-600 leading-tight font-heading truncate max-w-[120px] lg:max-w-none">
                {displayName}
              </span>
              <span className="text-xs lg:text-sm text-neutral-400 leading-tight truncate max-w-[120px] lg:max-w-none">
                {displayEmail}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
