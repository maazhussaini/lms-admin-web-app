/**
 * @file examples/ApiUsageExamples.tsx
 * @description Examples demonstrating the usage of enhanced API patterns
 */

import React, { useState, useEffect } from 'react';
import { 
  apiClient, 
  apiClientWithMeta, 
  apiPatterns, 
  PaginatedResponseResult,
  interceptorManager,
  commonInterceptors,
  ApiError
} from '@/api';
import { 
  useApiList, 
  useApiCreate, 
  useApiDelete 
} from '@/hooks/useApi';
import { ApiErrorBoundary } from '@/components/APIErrorBoundary/ApiErrorBoundary';

// Example types (replace with your actual types)
interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  enrollmentCount: number;
  createdAt: string;
}

interface CreateCourseData {
  title: string;
  description: string;
  instructor: string;
}

/**
 * Example 1: Basic API Usage with Original Client
 */
export const BasicApiExample: React.FC = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async (courseId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Using the original API client - just returns data
      const courseData = await apiClient.get<Course>(`/courses/${courseId}`);
      setCourse(courseData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        console.log('Error details:', {
          statusCode: err.statusCode,
          errorCode: err.errorCode,
          correlationId: err.correlationId,
          details: err.details
        });
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Basic API Usage</h3>
      <button 
        onClick={() => fetchCourse(1)}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Loading...' : 'Fetch Course 1'}
      </button>
      
      {error && <div className="text-red-500 mt-2">{error}</div>}
      {course && (
        <div className="mt-2">
          <h4>{course.title}</h4>
          <p>{course.description}</p>
          <p>Instructor: {course.instructor}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example 2: Enhanced API Usage with Metadata
 */
export const EnhancedApiExample: React.FC = () => {
  const [responseData, setResponseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchWithMetadata = async () => {
    setLoading(true);
    
    try {
      // Using enhanced client with metadata
      const response = await apiClientWithMeta.get<Course>('/courses/1', { 
        includeMeta: false // Changed to false to get just the data
      });
      
      setResponseData(response);
      
      // When includeMeta is false, response is just the data
      console.log('Response data:', response);
    } catch (err) {
      console.error('Error with full context:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Enhanced API with Metadata</h3>
      <button 
        onClick={fetchWithMetadata}
        disabled={loading}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Loading...' : 'Fetch with Metadata'}
      </button>
      
      {responseData && (
        <div className="mt-2 bg-gray-100 p-2 rounded">
          <pre>{JSON.stringify(responseData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

/**
 * Example 3: Paginated Data with API Patterns
 */
export const PaginatedApiExample: React.FC = () => {
  const [paginatedData, setPaginatedData] = useState<PaginatedResponseResult<Course> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPaginatedCourses = async (page: number = 1) => {
    setLoading(true);
    
    try {
      // Using API patterns for common operations
      const result = await apiPatterns.getList<Course>('/courses', {
        page,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc'
      });
      
      setPaginatedData(result);
      setCurrentPage(page);
    } catch (err) {
      console.error('Pagination error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedCourses();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Paginated API Example</h3>
      
      {loading && <div>Loading courses...</div>}
      
      {paginatedData && (
        <div>
          <div className="grid gap-2 mb-4">
            {paginatedData.items.map(course => (
              <div key={course.id} className="border p-2 rounded">
                <h4 className="font-semibold">{course.title}</h4>
                <p className="text-sm text-gray-600">{course.instructor}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <span>
              Page {paginatedData.pagination.page} of {paginatedData.pagination.totalPages}
              ({paginatedData.pagination.total} total courses)
            </span>
            
            <div className="space-x-2">
              <button
                onClick={() => fetchPaginatedCourses(currentPage - 1)}
                disabled={!paginatedData.pagination.hasPrev || loading}
                className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchPaginatedCourses(currentPage + 1)}
                disabled={!paginatedData.pagination.hasNext || loading}
                className="bg-gray-500 text-white px-3 py-1 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example 4: Using React Hooks for API Operations
 */
export const HooksApiExample: React.FC = () => {
  // Using hooks for different operations
  const { data: courses, loading: coursesLoading, error: coursesError, search } = 
    useApiList<Course>('/courses', { page: 1, limit: 5 });
  
  const { create: createCourse, loading: createLoading, error: createError } = 
    useApiCreate<Course, CreateCourseData>('/courses');
  
  const { delete: deleteCourse, loading: deleteLoading } = 
    useApiDelete('/courses');

  const [searchQuery, setSearchQuery] = useState('');
  const [newCourse, setNewCourse] = useState<CreateCourseData>({
    title: '',
    description: '',
    instructor: ''
  });

  const handleSearch = () => {
    search(searchQuery);
  };

  const handleCreateCourse = async () => {
    const result = await createCourse(newCourse);
    if (result) {
      // Reset form and refresh list
      setNewCourse({ title: '', description: '', instructor: '' });
      // Note: In a real app, you might want to refetch the list or update it optimistically
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    const success = await deleteCourse(courseId);
    if (success) {
      // Note: In a real app, you might want to refetch the list or update it optimistically
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-4">React Hooks API Example</h3>
      
      {/* Search */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses..."
            className="border px-3 py-2 rounded flex-1"
          />
          <button
            onClick={handleSearch}
            disabled={coursesLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>

      {/* Create Course Form */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-semibold mb-2">Create New Course</h4>
        <div className="grid gap-2">
          <input
            type="text"
            value={newCourse.title}
            onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Course Title"
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            value={newCourse.description}
            onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Course Description"
            className="border px-3 py-2 rounded"
          />
          <input
            type="text"
            value={newCourse.instructor}
            onChange={(e) => setNewCourse(prev => ({ ...prev, instructor: e.target.value }))}
            placeholder="Instructor Name"
            className="border px-3 py-2 rounded"
          />
          <button
            onClick={handleCreateCourse}
            disabled={createLoading || !newCourse.title}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {createLoading ? 'Creating...' : 'Create Course'}
          </button>
        </div>
        {createError && (
          <div className="text-red-500 mt-2">{createError.message}</div>
        )}
      </div>

      {/* Course List */}
      {coursesError && (
        <div className="text-red-500 mb-4">Error: {coursesError.message}</div>
      )}

      {coursesLoading ? (
        <div>Loading courses...</div>
      ) : (
        <div>
          <div className="grid gap-2 mb-4">
            {courses.map(course => (
              <div key={course.id} className="border p-3 rounded flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{course.title}</h4>
                  <p className="text-sm text-gray-600">{course.instructor}</p>
                  <p className="text-sm">{course.description}</p>
                </div>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  disabled={deleteLoading}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example 5: Interceptor Usage
 */
export const InterceptorExample: React.FC = () => {
  const [interceptors, setInterceptors] = useState<string[]>([]);

  const addRetryInterceptor = () => {
    const id = commonInterceptors.addRetryOnNetworkError(3, 1000);
    setInterceptors(prev => [...prev, `retry-${id}`]);
  };

  const addCacheInterceptor = () => {
    const id = commonInterceptors.addResponseCaching(60000); // 1 minute cache
    setInterceptors(prev => [...prev, `cache-${id}`]);
  };

  const clearAllInterceptors = () => {
    interceptorManager.clearAll();
    setInterceptors([]);
  };

  const testApiCall = async () => {
    try {
      const response = await apiClient.get('/courses/1');
      console.log('API call successful with interceptors:', response);
    } catch (error) {
      console.log('API call failed:', error);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-4">Interceptor Management Example</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={addRetryInterceptor}
          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Retry Interceptor
        </button>
        
        <button
          onClick={addCacheInterceptor}
          className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Cache Interceptor
        </button>
        
        <button
          onClick={clearAllInterceptors}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2"
        >
          Clear All Interceptors
        </button>
        
        <button
          onClick={testApiCall}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test API Call
        </button>
      </div>

      <div>
        <h4 className="font-semibold">Active Interceptors:</h4>
        <ul className="list-disc list-inside">
          {interceptors.map(id => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * Main Examples Component with Error Boundary
 */
export const ApiUsageExamples: React.FC = () => {
  return (
    <ApiErrorBoundary
      enableRetry={true}
      maxRetries={3}
      onError={(error, errorInfo) => {
        console.error('API Error in examples:', error, errorInfo);
      }}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Enhanced API Usage Examples</h1>
        
        <div className="space-y-6">
          <BasicApiExample />
          <EnhancedApiExample />
          <PaginatedApiExample />
          <HooksApiExample />
          <InterceptorExample />
        </div>
      </div>
    </ApiErrorBoundary>
  );
};

export default ApiUsageExamples;
