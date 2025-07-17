import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MyCoursesSearchBar } from '@/components/common/SearchBar';
import { CourseSelector } from '@/components/features/MyCourses/CourseSelector';

/**
 * MyCoursesPage - Static UI scaffold for the student courses page
 *
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 * No data is fetched yet; all content is static/dummy for UI scaffolding.
 */
const programCategories = [
  { name: 'Science', color: 'bg-cyan-200' },
  { name: 'Computer', color: 'bg-blue-200' },
  { name: 'Arts', color: 'bg-pink-200' },
  { name: 'Marketing', color: 'bg-yellow-200' },
  { name: 'Finance', color: 'bg-green-200' },
  { name: 'History', color: 'bg-orange-200' },
  { name: 'Fashion', color: 'bg-purple-200' },
  { name: 'Science', color: 'bg-cyan-200' },
  { name: 'Computer', color: 'bg-blue-200' },
  { name: 'Arts', color: 'bg-pink-200' },
  { name: 'Marketing', color: 'bg-yellow-200' },
];

const DUMMY_CARDS = 6;

const MyCoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'unenrolled'>('all');
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  /**
   * Handle course tab changes
   */
  const handleTabChange = useCallback((tab: 'all' | 'enrolled' | 'unenrolled') => {
    setActiveTab(tab);
    // TODO: Implement filtering logic based on tab selection
    // This will eventually trigger API calls to fetch filtered course data
    console.log('Tab changed to:', tab);
  }, []);

  /**
   * Handle search query changes
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implement actual search functionality
    console.log('Searching for:', query);
  }, []);

  /**
   * Handle filter button click
   */
  const handleFilterClick = useCallback(() => {
    // TODO: Implement filter modal/dropdown functionality
    setHasActiveFilters(prev => !prev); // Temporary toggle for demo
    console.log('Filter clicked');
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.3, ease: 'anticipate' }}
      className="w-full h-full"
    >
      {/* Main Content Container */}
      <div className="space-y-4 sm:space-y-6">
        {/* Page Description - Only shown on desktop */}
        <div className="hidden sm:block">
          <p className="text-sm sm:text-base text-neutral-600">
            Discover and manage your learning journey
          </p>
        </div>

        {/* Course Selector and Search Bar - Mobile First Responsive */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {/* Course Selector - Full width on mobile */}
          <div className="w-full sm:w-auto flex justify-center sm:justify-start">
            <CourseSelector
              activeTab={activeTab}
              onTabChange={handleTabChange}
              counts={{
                all: 50,
                enrolled: 4,
                unenrolled: 0
              }}
              className="w-full sm:w-auto"
            />
          </div>
          
          {/* Search Bar - Full width on mobile, expanded on desktop */}
          <div className="w-full sm:flex-1 sm:max-w-2xl">
            <MyCoursesSearchBar
              value={searchQuery}
              onSearch={handleSearch}
              onFilterClick={handleFilterClick}
              hasActiveFilters={hasActiveFilters}
              placeholder="Search here"
              className="w-full"
            />
          </div>
        </div>

        {/* Programs Row - Mobile Optimized */}
        <section className="space-y-2 sm:space-y-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2 sm:mb-3">
              Programs
            </h2>
          </div>
          
          {/* Horizontal scroll on mobile, grid on larger screens */}
          <div className="flex flex-row gap-3 sm:gap-4 overflow-x-auto pb-2 sm:overflow-x-visible sm:flex-wrap sm:justify-start">
            {programCategories.map((cat, idx) => (
              <div
                key={cat.name + idx}
                className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] flex-shrink-0 sm:flex-shrink"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${cat.color} transition-transform hover:scale-105 active:scale-95 cursor-pointer`}
                >
                  {/* Placeholder for icon */}
                  <span className="text-xl sm:text-2xl">🎓</span>
                </div>
                <span className="mt-2 text-xs sm:text-sm font-medium text-neutral-700 text-center leading-tight">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Courses Grid - Mobile First Responsive */}
        <section className="space-y-2 sm:space-y-3">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2 sm:mb-3">
              Your Courses
            </h2>
          </div>
          
          {/* Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: DUMMY_CARDS }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 min-h-[140px] sm:min-h-[160px] animate-pulse border border-neutral-100 cursor-pointer active:scale-[0.98] sm:hover:scale-[1.02]"
                aria-label="Course card placeholder"
              >
                {/* Course Card Content Placeholder */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-neutral-200 rounded animate-pulse"></div>
                  <div className="h-2 sm:h-3 bg-neutral-100 rounded animate-pulse w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-neutral-100 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default MyCoursesPage;