import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MyCoursesSearchBar } from '@/components/common/SearchBar';
import { CourseSelector } from '@/components/features/MyCourses/CourseSelector';
import { FilterBar } from '@/components/features/MyCourses/ProgramNavigator';
import CourseCardGrid from '@/components/features/MyCourses/CourseCardGrid';
import { useCourseData } from '@/hooks/useCourseData';
import { useBatchRetry } from '@/hooks/useApi';
import type { CourseTypeFilter } from '@/components/common/SearchBar/CourseTypeFilterDropdown';

/**
 * MyCoursesPage - Main page component with hierarchical navigation structure
 *
 * Structure:
 * ├── CourseSelector (tabs)
 * ├── SearchBar
 * └── ProgramNavigator (programs and specializations only)
 * └── CourseCard Grid (courses display)
 *
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 * 
 * Architecture: Uses useCourseData hook for all business logic, following Single Responsibility Principle
 */
const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // All course-related logic is handled by the custom hook
  const {
    // Data
    courses: filteredCourses,
    progressData,
    courseCounts,
    
    // State
    activeTab,
    setActiveTab,
    
    // Filter management
    filterState,
    updateSearchQuery,
    updateProgram,
    updateSpecialization,
    updateCourseType,
    clearProgram,
    clearSpecialization,
    clearAllFilters,
    hasActiveFilters,
    
    // Loading and error states
    isLoading,
    error,
    
    // Raw API hooks for error handling
    courseDiscoveryHook,
    enrollmentsHook,
  } = useCourseData();

  // Batch retry for both API hooks
  const { retryAll: retryAllData } = useBatchRetry([
    courseDiscoveryHook,
    enrollmentsHook,
  ]);

  /**
   * Handler functions following Single Responsibility Principle
   */
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  const handleCourseTypeSelect = (courseType: CourseTypeFilter) => {
    updateCourseType(courseType);
    setIsFilterDropdownOpen(false);
  };

  const handleCourseClick = (courseId: number) => {
    navigate(`/courses/${courseId}`);
  };

  const handleRetry = () => {
    retryAllData();
  };

  // Enhanced error handling with better UX
  if (error) {
    const canRetry = !isLoading;
    const errorMessage = error.message || 'An unexpected error occurred';
    const isAuthError = errorMessage.toLowerCase().includes('authentication') || 
                        errorMessage.toLowerCase().includes('unauthorized') ||
                        errorMessage.toLowerCase().includes('token');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="text-center py-12 px-6 max-w-md">
          <div className="mb-6">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isAuthError ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <svg className={`w-8 h-8 ${isAuthError ? 'text-yellow-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isAuthError ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isAuthError ? 'Session Expired' : 'Unable to load courses'}
          </h2>
          <p className="text-gray-600 mb-6">
            {isAuthError 
              ? 'Your session has expired. You will be redirected to the login page.'
              : errorMessage
            }
          </p>
          {!isAuthError && (
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                disabled={!canRetry}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  canRetry 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Retrying...' : 'Retry'}
              </button>
              {canRetry && (
                <p className="text-sm text-gray-500">
                  Click retry to reload the course data
                </p>
              )}
            </div>
          )}
          {isAuthError && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.3, ease: 'anticipate' }}
      className="w-full h-full"
    >
      {/* Main Content Container */}
      <div className="space-y-4 sm:space-y-6 laptop:space-y-4 xl:space-y-8">
        {/* Course Selector and Search Bar - Mobile First Responsive */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 laptop:gap-4 xl:gap-8">
          {/* Course Selector - Intrinsic width based on content */}
          <CourseSelector
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={courseCounts}
          />
          
          {/* Search Bar - Flex to fill remaining space */}
          <div className="w-full sm:flex-1">
            <MyCoursesSearchBar
              value={filterState.searchQuery}
              onSearch={updateSearchQuery}
              onFilterClick={() => setIsFilterDropdownOpen(true)}
              hasActiveFilters={hasActiveFilters}
              placeholder="Search here"
              className="w-full"
              selectedCourseType={filterState.selectedCourseType}
              onCourseTypeSelect={handleCourseTypeSelect}
              isFilterDropdownOpen={isFilterDropdownOpen}
              onFilterDropdownClose={() => setIsFilterDropdownOpen(false)}
            />
          </div>
        </div>

        {/* Filter Bar with loading state awareness */}
        <div className="mb-8 laptop:mb-6 xl:mb-10">
          <FilterBar
            selectedProgram={filterState.selectedProgram}
            selectedSpecialization={filterState.selectedSpecialization}
            onProgramSelect={updateProgram}
            onSpecializationSelect={updateSpecialization}
            onClearProgram={clearProgram}
            onClearSpecialization={clearSpecialization}
            onClearAllFilters={clearAllFilters}
          />
          {isLoading && (
            <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
              <span>Updating course list...</span>
            </div>
          )}
        </div>

        {/* Course Card Grid - Always shown */}
        <CourseCardGrid
          courses={filteredCourses}
          loading={isLoading}
          progressData={progressData}
          onCourseClick={handleCourseClick}
          activeTab={activeTab}
        />
      </div>
    </motion.div>
  );
};

export default MyCoursesPage;