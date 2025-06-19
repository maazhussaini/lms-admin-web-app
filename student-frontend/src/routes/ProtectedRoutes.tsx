import React from 'react';
import { useLocation } from 'react-router-dom';
import { StudentGuard } from './guards';

// Temporary layout component for development
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">🎓 Student LMS Portal</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                📊 Dashboard
              </a>
              <a href="/courses" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                📚 Courses
              </a>
              <a href="/assignments" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                📝 Assignments
              </a>
              <a href="/grades" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                📈 Grades
              </a>
              <a href="/profile" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                👤 Profile
              </a>
            </nav>
            
            <div className="flex items-center space-x-2">
              <a href="/notifications" className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100">
                🔔
              </a>
              <a href="/settings" className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100">
                ⚙️
              </a>
              <button className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2024 Student LMS Portal. All rights reserved. | Development Mode
          </p>
        </div>
      </footer>
    </div>
  );
};

// Dummy page component for protected routes
const DummyProtectedPage = ({ 
  pageName, 
  description, 
  icon 
}: { 
  pageName: string; 
  description: string; 
  icon: string; 
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h1 className="text-2xl font-bold text-gray-900">{pageName}</h1>
      </div>
      
      <p className="text-gray-600 mb-6">{description}</p>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-blue-500 text-lg">ℹ️</span>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Development Status</h3>
            <p className="text-sm text-blue-700 mt-1">
              This is a placeholder component. The actual {pageName.toLowerCase()} functionality will be implemented in upcoming iterations.
            </p>
          </div>
        </div>
      </div>
      
      {/* Mock content area */}
      <div className="mt-6 space-y-4">
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Development navigation */}
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-yellow-900 mb-2">🚧 Development Navigation</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <a href="/dashboard" className="text-blue-600 hover:text-blue-800 underline">Dashboard</a>
        <a href="/courses" className="text-blue-600 hover:text-blue-800 underline">Courses</a>
        <a href="/assignments" className="text-blue-600 hover:text-blue-800 underline">Assignments</a>
        <a href="/quizzes" className="text-blue-600 hover:text-blue-800 underline">Quizzes</a>
        <a href="/grades" className="text-blue-600 hover:text-blue-800 underline">Grades</a>
        <a href="/notifications" className="text-blue-600 hover:text-blue-800 underline">Notifications</a>
        <a href="/profile" className="text-blue-600 hover:text-blue-800 underline">Profile</a>
        <a href="/settings" className="text-blue-600 hover:text-blue-800 underline">Settings</a>
      </div>
    </div>
  </div>
);

// Dummy page components with appropriate icons and descriptions
const DashboardPage = () => (
  <DummyProtectedPage 
    pageName="Dashboard" 
    description="Your personalized learning overview with recent activities, upcoming deadlines, and progress summaries."
    icon="📊"
  />
);

const ProfilePage = () => (
  <DummyProtectedPage 
    pageName="Profile" 
    description="Manage your personal information, preferences, and account settings."
    icon="👤"
  />
);

const CourseListPage = () => (
  <DummyProtectedPage 
    pageName="Courses" 
    description="Browse and access all your enrolled courses with progress tracking and quick navigation."
    icon="📚"
  />
);

const CourseDetailPage = () => (
  <DummyProtectedPage 
    pageName="Course Details" 
    description="Detailed view of course content, modules, lectures, and learning materials."
    icon="📖"
  />
);

const LectureViewerPage = () => (
  <DummyProtectedPage 
    pageName="Lecture Viewer" 
    description="Secure video player and content viewer for accessing course lectures and materials."
    icon="🎥"
  />
);

const AssignmentsPage = () => (
  <DummyProtectedPage 
    pageName="Assignments" 
    description="View, complete, and submit assignments with deadline tracking and submission history."
    icon="📝"
  />
);

const QuizzesPage = () => (
  <DummyProtectedPage 
    pageName="Quizzes" 
    description="Take online quizzes and assessments with timer functionality and instant feedback."
    icon="❓"
  />
);

const GradesPage = () => (
  <DummyProtectedPage 
    pageName="Grades" 
    description="View your academic performance, grades, and detailed feedback from instructors."
    icon="📈"
  />
);

const NotificationsPage = () => (
  <DummyProtectedPage 
    pageName="Notifications" 
    description="Stay updated with course announcements, deadlines, and important system messages."
    icon="🔔"
  />
);

const SettingsPage = () => (
  <DummyProtectedPage 
    pageName="Settings" 
    description="Configure your account preferences, notification settings, and privacy options."
    icon="⚙️"
  />
);

const NotFoundPage = () => (
  <DummyProtectedPage 
    pageName="Page Not Found" 
    description="The requested page could not be found. It may have been moved or doesn't exist."
    icon="❌"
  />
);

/**
 * Protected routes component that renders the appropriate page based on current path
 * All routes are wrapped with MainLayout and StudentGuard
 */
export const ProtectedRoutes: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Route to component mapping
  const renderPage = () => {
    // Handle parameterized routes
    if (currentPath.startsWith('/courses/') && currentPath.includes('/lectures/')) {
      return <LectureViewerPage />;
    }
    if (currentPath.startsWith('/courses/') && currentPath !== '/courses') {
      return <CourseDetailPage />;
    }
    
    // Handle exact routes
    switch (currentPath) {
      case '/dashboard':
        return <DashboardPage />;
      case '/profile':
        return <ProfilePage />;
      case '/settings':
        return <SettingsPage />;
      case '/courses':
        return <CourseListPage />;
      case '/assignments':
        return <AssignmentsPage />;
      case '/quizzes':
        return <QuizzesPage />;
      case '/grades':
        return <GradesPage />;
      case '/notifications':
        return <NotificationsPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <StudentGuard>
      <MainLayout>
        {renderPage()}
      </MainLayout>
    </StudentGuard>
  );
};
