import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MyCoursesSearchBar } from '@/components/common/SearchBar';
import { CourseSelector } from '@/components/features/MyCourses/CourseSelector';
import CourseCard from '@/components/features/MyCourses/CourseCard';
import type { Course, StudentCourseProgress } from '@shared/types';

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

// Mock course data for UI demonstration
const mockCourses: Course[] = [
  {
    course_id: 1,
    course_name: 'Computer Science',
    course_description: 'Software Engineering',
    course_total_hours: 3.25, // 3 hours 15 minutes
    course_status: 'PUBLISHED' as const,
    main_thumbnail_url: null,
    specialization_id: 1,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  },
  {
    course_id: 2,
    course_name: 'Introduction to React',
    course_description: 'Learn the fundamentals of React development and modern web applications',
    course_total_hours: 8.5,
    course_status: 'PUBLISHED' as const,
    main_thumbnail_url: null,
    specialization_id: 1,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  },
  {
    course_id: 3,
    course_name: 'Advanced JavaScript',
    course_description: 'Master advanced JavaScript concepts including ES6+, async programming, and design patterns',
    course_total_hours: 12.0,
    course_status: 'PUBLISHED' as const,
    main_thumbnail_url: null,
    specialization_id: 1,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  },
  {
    course_id: 4,
    course_name: 'Database Design',
    course_description: 'Learn relational database design principles and SQL optimization',
    course_total_hours: 6.75,
    course_status: 'PUBLISHED' as const,
    main_thumbnail_url: null,
    specialization_id: 2,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  },
  {
    course_id: 5,
    course_name: 'UI/UX Design Fundamentals',
    course_description: 'Master the principles of user interface and user experience design',
    course_total_hours: 10.5,
    course_status: 'PUBLISHED' as const,
    main_thumbnail_url: null,
    specialization_id: 3,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  },
  {
    course_id: 6,
    course_name: 'Digital Marketing Strategy',
    course_description: 'Comprehensive guide to modern digital marketing techniques and tools',
    course_total_hours: 4.5,
    course_status: 'PUBLISHED' as const,
    main_thumbnail_url: null,
    specialization_id: 4,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  }
];

// Mock instructors data
const mockInstructors = [
  { name: 'Chris Evans', title: 'CS Professor' },
  { name: 'Sarah Johnson', title: 'React Specialist' },
  { name: 'Michael Chen', title: 'JavaScript Expert' },
  { name: 'Emily Rodriguez', title: 'Database Architect' },
  { name: 'David Kim', title: 'UX Designer' },
  { name: 'Lisa Thompson', title: 'Marketing Director' }
];

// Mock progress data
const mockProgress: StudentCourseProgress[] = [
  {
    student_course_progress_id: 1,
    student_id: 1,
    course_id: 1,
    overall_progress_percentage: 75,
    modules_completed: 3,
    videos_completed: 8,
    quizzes_completed: 2,
    assignments_completed: 1,
    total_time_spent_minutes: 180,
    last_accessed_at: new Date().toISOString(),
    is_course_completed: false,
    completion_date: null,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  },
  {
    student_course_progress_id: 2,
    student_id: 1,
    course_id: 2,
    overall_progress_percentage: 45,
    modules_completed: 2,
    videos_completed: 5,
    quizzes_completed: 1,
    assignments_completed: 0,
    total_time_spent_minutes: 240,
    last_accessed_at: new Date().toISOString(),
    is_course_completed: false,
    completion_date: null,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  }
];

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

  /**
   * Handle course card click
   */
  const handleCourseClick = useCallback((courseId: number) => {
    // TODO: Navigate to course detail page
    console.log('Course clicked:', courseId);
    // Example: navigate(`/courses/${courseId}`);
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

        {/* Programs Row - Mobile Optimized (Larger) */}
        <section className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6 tracking-tight">
              Programs
            </h2>
          </div>
          {/* Horizontal scroll on mobile, grid on larger screens */}
          <div className="flex flex-row gap-1 sm:gap-2 overflow-x-auto pb-4 sm:overflow-x-visible sm:flex-wrap sm:justify-start">
            {programCategories.map((cat, idx) => (
              <div
                key={cat.name + idx}
                className="flex flex-col items-center min-w-[90px] sm:min-w-[110px] flex-shrink-0 sm:flex-shrink"
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center ${cat.color} transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-md`}
                >
                  {/* Placeholder for icon */}
                  <span className="text-3xl sm:text-4xl">🎓</span>
                </div>
                <span className="mt-3 text-sm sm:text-base font-semibold text-neutral-800 text-center leading-tight">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Courses Grid - Mobile First Responsive */}
        <section className="space-y-2 sm:space-y-3">
          {/* Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
            {mockCourses.map((course, idx) => (
              <CourseCard
                key={course.course_id}
                course={course}
                instructor={mockInstructors[idx % mockInstructors.length]}
                progress={mockProgress.find(p => p.course_id === course.course_id)}
                programName={course.course_description?.split(' ')[0] || 'General'}
                isFree={true}
                onClick={handleCourseClick}
                className="h-full w-full min-w-0 p-2 sm:p-3"
              />
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default MyCoursesPage;