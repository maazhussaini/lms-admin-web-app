import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MyCoursesSearchBar } from '@/components/common/SearchBar';

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

const dummyTabs = [
  { label: 'All Courses', count: 50, active: true },
  { label: 'Enrolled', count: 4 },
  { label: 'Unenrolled', count: 0 },
];

const DUMMY_CARDS = 6;

const MyCoursesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Handle search query changes
   */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // TODO: Implement actual search functionality
    console.log('Searching for:', query);
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.3, ease: 'anticipate' }}
      className="space-y-8"
    >
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">My Courses</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {dummyTabs.map((tab) => (
          <button
            key={tab.label}
            className={`px-6 py-2 rounded-full font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
              tab.active
                ? 'bg-primary-500 text-white shadow'
                : 'bg-white text-primary-500 border border-primary-200'
            }`}
            tabIndex={0}
            aria-current={tab.active ? 'page' : undefined}
          >
            {tab.label} <span className="ml-1 text-sm font-normal">({tab.count.toString().padStart(2, '0')})</span>
          </button>
        ))}
      </div>

      {/* Programs Row */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Programs</h2>
        <div className="flex flex-row gap-4 overflow-x-auto pb-2">
          {programCategories.map((cat, idx) => (
            <div
              key={cat.name + idx}
              className="flex flex-col items-center min-w-[80px]"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${cat.color}`}
              >
                {/* Placeholder for icon */}
                <span className="text-2xl">🎓</span>
              </div>
              <span className="mt-2 text-sm font-medium text-neutral-700 text-center">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Search Bar */}
      <div className="flex justify-end mb-6">
        <MyCoursesSearchBar
          value={searchQuery}
          onSearch={handleSearch}
          placeholder="Search here"
          className="w-full max-w-md"
        />
      </div>

      {/* Courses Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: DUMMY_CARDS }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-4 min-h-[160px] animate-pulse border border-neutral-100"
              aria-label="Course card placeholder"
            >
              {/* Blank card content for now */}
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default MyCoursesPage;