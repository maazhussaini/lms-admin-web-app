import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MyCoursesSearchBar } from '@/components/common/SearchBar';
import { CourseSelector } from '@/components/features/MyCourses/CourseSelector';
import { FilterBar } from '@/components/features/MyCourses/ProgramNavigator';
import CourseCardGrid from '@/components/features/MyCourses/CourseCardGrid';
import { useApiList } from '@/hooks/useApi';
import type { CourseTypeFilter } from '@/components/common/SearchBar/CourseTypeFilterDropdown';
import { 
  type CourseDiscoveryItem,
  type EnrollmentItem,
  type Program, 
  type Specialization
} from '@/services';
import type { StudentCourseProgress } from '@shared/types/course.types';

// Extended Course type for UI display
type ExtendedCourse = {
  course_id: number;
  course_name: string;
  course_description: string;
  main_thumbnail_url: string | null;
  course_total_hours: number;
  teacher_name?: string;
  teacher_qualification?: string | null;
  purchase_status?: string;
  is_purchased?: boolean;
  program_name?: string;
  profile_picture_url?: string | null;
  start_date?: string;
  end_date?: string;
  course_type: 'FREE' | 'PAID';
  course_price: number;
  specialization_id: number;
};

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
 */
const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled' | 'unenrolled'>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  // Filter state (simplified - no navigation states)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<Specialization | null>(null);
  const [selectedCourseType, setSelectedCourseType] = useState<CourseTypeFilter>('all');

  // Course discovery API with useApiList hook
  const { 
    data: courseDiscoveryData, 
    pagination: coursePagination,
    loading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses
  } = useApiList<CourseDiscoveryItem>('/student/profile/courses/discover', {
    page: 1,
    limit: 50,
    ...(searchQuery && { search: searchQuery }),
    ...(selectedProgram && { program_id: selectedProgram.program_id.toString() }),
    ...(selectedSpecialization && { specialization_id: selectedSpecialization.specialization_id.toString() })
  });

  // Enrollments API call
  const { 
    data: enrollmentsData, 
    loading: enrollmentsLoading,
    pagination: enrollmentsPagination,
    error: enrollmentsError 
  } = useApiList<EnrollmentItem>('/student/profile/enrollments', {
    page: 1,
    limit: 50,
    status: 'ACTIVE'
  });

  // Combined loading state
  const isLoading = coursesLoading || enrollmentsLoading;

  // Debug: Log current filter state with performance metrics
  useEffect(() => {
    console.log('📊 Current filter state:', {
      selectedProgram: selectedProgram?.program_name,
      selectedSpecialization: selectedSpecialization?.specialization_name,
      activeTab,
      coursesLoading,
      enrollmentsLoading,
      totalCourses: courseDiscoveryData?.length || 0,
      totalEnrollments: enrollmentsData?.length || 0,
      isLoading
    });
  }, [selectedProgram, selectedSpecialization, activeTab, coursesLoading, enrollmentsLoading, courseDiscoveryData, enrollmentsData, isLoading]);

  // Create progress data from enrollment
  const progressData = enrollmentsData?.map((item): StudentCourseProgress => ({
    student_course_progress_id: item.enrollment_id,
    student_id: 1,
    course_id: item.course_id,
    overall_progress_percentage: item.overall_progress_percentage,
    modules_completed: 0,
    videos_completed: 0,
    quizzes_completed: 0,
    assignments_completed: 0,
    total_time_spent_minutes: 0,
    last_accessed_at: new Date().toISOString(),
    is_course_completed: item.overall_progress_percentage === 100,
    completion_date: item.overall_progress_percentage === 100 ? new Date().toISOString() : null,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1'
  })) || [];

  // Helper functions to convert API data to UI format
  const convertCourseDiscoveryToCard = useCallback((item: CourseDiscoveryItem): ExtendedCourse => {
    let price = 0;
    if (!item.is_purchased && !item.is_free && item.purchase_status.includes('Buy: $')) {
      const priceMatch = item.purchase_status.match(/\$(\d+\.?\d*)/);
      if (priceMatch && priceMatch[1]) {
        price = parseFloat(priceMatch[1]);
      }
    }

    return {
      course_id: item.course_id,
      course_name: item.course_name,
      course_description: item.program_name,
      main_thumbnail_url: item.profile_picture_url,
      course_total_hours: parseFloat(item.course_total_hours.replace(' hrs', '')),
      teacher_name: item.teacher_name,
      teacher_qualification: item.teacher_qualification,
      purchase_status: item.purchase_status,
      is_purchased: item.is_purchased,
      program_name: item.program_name,
      profile_picture_url: item.profile_picture_url,
      start_date: item.start_date,
      end_date: item.end_date,
      course_type: (item.is_free || item.is_purchased) ? 'FREE' : 'PAID',
      course_price: price,
      specialization_id: 1 // Default value since not provided in discovery API
    };
  }, []);

  const convertEnrollmentToCard = useCallback((item: EnrollmentItem): ExtendedCourse => ({
    course_id: item.course_id,
    course_name: item.course_name,
    course_description: `${item.program_name} • ${item.specialization_name}`,
    main_thumbnail_url: item.profile_picture_url,
    course_total_hours: parseFloat(item.course_total_hours.replace('h', '')),
    teacher_name: item.teacher_name,
    teacher_qualification: item.teacher_qualification,
    purchase_status: 'Purchased',
    is_purchased: true,
    program_name: item.program_name,
    profile_picture_url: item.profile_picture_url,
    start_date: item.start_date,
    end_date: item.end_date,
    course_type: 'PAID',
    course_price: 0,
    specialization_id: item.specialization_id
  }), []);

  // Optimized data transformation - separate from filtering  
  const transformedCourses = useMemo(() => {
    const startTime = performance.now();
    let courses: ExtendedCourse[] = [];
    
    if (activeTab === 'enrolled') {
      courses = enrollmentsData?.map(convertEnrollmentToCard) || [];
    } else if (activeTab === 'unenrolled') {
      const enrolledIds = new Set(enrollmentsData?.map(e => e.course_id) || []);
      courses = courseDiscoveryData
        ?.filter(course => !enrolledIds.has(course.course_id))
        .map(convertCourseDiscoveryToCard) || [];
    } else {
      // All courses: combine enrolled + unenrolled
      const enrolledCourses = enrollmentsData?.map(convertEnrollmentToCard) || [];
      const enrolledIds = new Set(enrollmentsData?.map(e => e.course_id) || []);
      const unenrolledCourses = courseDiscoveryData
        ?.filter(course => !enrolledIds.has(course.course_id))
        .map(convertCourseDiscoveryToCard) || [];
      courses = [...enrolledCourses, ...unenrolledCourses];
    }

    const endTime = performance.now();
    console.log(`🔄 Data transformation took ${(endTime - startTime).toFixed(2)}ms for ${courses.length} courses`);
    
    return courses;
  }, [
    activeTab,
    courseDiscoveryData,
    enrollmentsData,
    convertCourseDiscoveryToCard,
    convertEnrollmentToCard
  ]);

  // Filtered courses based on current filter state - optimized separately
  const filteredCourses = useMemo(() => {
    const startTime = performance.now();
    let courses = transformedCourses;

    // Filter by selected program (courses from discovery API already include program filter)
    if (selectedProgram) {
      courses = courses.filter(course => 
        course.program_name?.toLowerCase() === selectedProgram.program_name.toLowerCase()
      );
    }

    // Filter by selected specialization (courses from discovery API already include specialization filter)  
    if (selectedSpecialization) {
      courses = courses.filter(course => 
        course.specialization_id === selectedSpecialization.specialization_id
      );
    }

    // Filter by course type
    if (selectedCourseType !== 'all') {
      courses = courses.filter(course => {
        const isPaid = course.course_type === 'PAID' || (course.course_price && course.course_price > 0);
        const isPurchased = course.is_purchased || false;
        
        switch (selectedCourseType) {
          case 'free':
            return !isPaid;
          case 'paid':
            return isPaid && !isPurchased;
          case 'purchased':
            return isPurchased;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(course => 
        course.course_name.toLowerCase().includes(query) ||
        course.program_name?.toLowerCase().includes(query) ||
        course.teacher_name?.toLowerCase().includes(query)
      );
    }

    const endTime = performance.now();
    console.log(`🔍 Filter operation took ${(endTime - startTime).toFixed(2)}ms, result: ${courses.length} courses`);

    return courses;
  }, [
    transformedCourses,
    selectedProgram,
    selectedSpecialization,
    selectedCourseType,
    searchQuery
  ]);

  /**
   * Handle course tab changes
   */
  const handleTabChange = useCallback((tab: 'all' | 'enrolled' | 'unenrolled') => {
    setActiveTab(tab);
  }, []);

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return selectedProgram !== null || 
           selectedSpecialization !== null || 
           selectedCourseType !== 'all';
  }, [selectedProgram, selectedSpecialization, selectedCourseType]);

  /**
   * Handle course type filter selection
   */
  const handleCourseTypeSelect = useCallback((courseType: CourseTypeFilter) => {
    setSelectedCourseType(courseType);
    setIsFilterDropdownOpen(false);
  }, []);

  /**
   * Handle filter dropdown close
   */
  const handleFilterDropdownClose = useCallback(() => {
    setIsFilterDropdownOpen(false);
  }, []);

  /**
   * Handle course card click
   */
  const handleCourseClick = useCallback((courseId: number) => {
    navigate(`/courses/${courseId}`);
  }, [navigate]);

  /**
   * Filter handlers for program/specialization
   */
  const handleProgramSelect = useCallback((program: Program) => {
    console.log('🏫 Program selected:', program);
    setSelectedProgram(program);
    setSelectedSpecialization(null);
  }, []);

  const handleSpecializationSelect = useCallback((specialization: Specialization) => {
    console.log('🎯 Specialization selected:', specialization);
    setSelectedSpecialization(specialization);
  }, []);

  const handleClearProgram = useCallback(() => {
    console.log('🧹 Clearing program filter');
    setSelectedProgram(null);
    setSelectedSpecialization(null);
  }, []);

  const handleClearSpecialization = useCallback(() => {
    console.log('🧹 Clearing specialization filter');
    setSelectedSpecialization(null);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    console.log('🧹 Clearing all filters');
    setSelectedProgram(null);
    setSelectedSpecialization(null);
  }, []);

  // Enhanced error handling with better UX
  const error = coursesError || enrollmentsError;
  if (error) {
    const canRetry = !isLoading;
    const errorMessage = error.message || 'An unexpected error occurred';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="text-center py-12 px-6 max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load courses</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                refetchCourses();
                // Also refetch enrollments if it failed
                if (enrollmentsError && typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
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
      <div className="space-y-4 sm:space-y-6">
        {/* Course Selector and Search Bar - Mobile First Responsive */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {/* Course Selector - Full width on mobile */}
          <div className="w-full sm:w-full flex justify-center sm:justify-start">
            <CourseSelector
              activeTab={activeTab}
              onTabChange={handleTabChange}
              counts={{
                all: coursePagination?.total || courseDiscoveryData?.length || 0,
                enrolled: enrollmentsPagination?.total || enrollmentsData?.length || 0,
                unenrolled: Math.max(0, (coursePagination?.total || courseDiscoveryData?.length || 0) - (enrollmentsPagination?.total || enrollmentsData?.length || 0))
              }}
              className="w-full sm:w-full"
            />
          </div>
          
          {/* Search Bar - Full width on mobile, expanded on desktop */}
          <div className="w-full sm:w-full">
            <MyCoursesSearchBar
              value={searchQuery}
              onSearch={setSearchQuery}
              onFilterClick={() => setIsFilterDropdownOpen(true)}
              hasActiveFilters={hasActiveFilters}
              placeholder="Search here"
              className="w-full"
              selectedCourseType={selectedCourseType}
              onCourseTypeSelect={handleCourseTypeSelect}
              isFilterDropdownOpen={isFilterDropdownOpen}
              onFilterDropdownClose={handleFilterDropdownClose}
            />
          </div>
        </div>

        {/* Filter Bar with loading state awareness */}
        <div className="mb-8">
          <FilterBar
            selectedProgram={selectedProgram}
            selectedSpecialization={selectedSpecialization}
            onProgramSelect={handleProgramSelect}
            onSpecializationSelect={handleSpecializationSelect}
            onClearProgram={handleClearProgram}
            onClearSpecialization={handleClearSpecialization}
            onClearAllFilters={handleClearAllFilters}
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