import React from 'react';
import { RouteObject } from 'react-router-dom';
import { AuthGuard, PublicOnlyGuard, LayoutGuard } from './guards';

// Import the actual LoginPage component
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));

// Dummy components for development purposes
const DummyComponent = ({ pageName }: { pageName: string }) => (
  <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
    <div style={{ 
      padding: '2rem', 
      background: '#f0f4f8', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1rem'
    }}>
      <h1 style={{ marginTop: 0 }}>{pageName} Page</h1>
      <p>This is a dummy component for the {pageName.toLowerCase()} page.</p>
      <p>Replace this with the actual component implementation.</p>
    </div>
    
    {/* Navigation links for easier development */}
    <div style={{ marginTop: '2rem' }}>
      <h3>Development Navigation</h3>
      <ul>
        <li><a href="/login">Login</a></li>
        <li><a href="/forgot-password">Forgot Password</a></li>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/courses">Course List</a></li>
        <li><a href="/courses/1">Course Details (ID: 1)</a></li>
        <li><a href="/profile">Profile</a></li>
      </ul>
    </div>
  </div>
);

// Dummy layout component
const DummyLayout = ({ children }: { children: React.ReactNode }) => (
  <div>
    <header style={{ 
      padding: '1rem', 
      background: '#1e40af', 
      color: 'white',
      marginBottom: '1rem'
    }}>
      <h2 style={{ margin: 0 }}>Student LMS - Main Layout</h2>
      <nav style={{ marginTop: '0.5rem' }}>
        <a href="/dashboard" style={{ color: 'white', marginRight: '1rem' }}>Dashboard</a>
        <a href="/courses" style={{ color: 'white', marginRight: '1rem' }}>Courses</a>
        <a href="/profile" style={{ color: 'white', marginRight: '1rem' }}>Profile</a>
        <button style={{ 
          marginLeft: '1rem', 
          background: '#dc2626', 
          color: 'white',
          border: 'none',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </nav>
    </header>
    <main>
      {children}
    </main>
    <footer style={{ marginTop: '2rem', textAlign: 'center', padding: '1rem', borderTop: '1px solid #ddd' }}>
      <p>© 2023 Student LMS Portal</p>
    </footer>
  </div>
);

/**
 * Loading component for lazy-loaded routes
 */
const LoadingFallback = () => (
  <div className="page-loading">
    <div className="loading-spinner" />
    <p>Loading...</p>
  </div>
);

/**
 * Route configuration with actual login page
 */
export const routes: RouteObject[] = [
  // Public routes (login, registration, etc.)
  {
    element: <PublicOnlyGuard />,
    children: [
      {
        path: 'login',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <LoginPage />
          </React.Suspense>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <DummyComponent pageName="Forgot Password" />
          </React.Suspense>
        ),
      },
      {
        path: 'reset-password',
        element: (
          <React.Suspense fallback={<LoadingFallback />}>
            <DummyComponent pageName="Reset Password" />
          </React.Suspense>
        ),
      },
    ],
  },
  
  // Protected routes with main layout
  {
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <LayoutGuard 
          layout={DummyLayout} 
        />
      </React.Suspense>
    ),
    children: [
      {
        element: <AuthGuard />,
        children: [
          {
            path: '/',
            element: (
              <React.Suspense fallback={<LoadingFallback />}>
                <DummyComponent pageName="Dashboard (Home)" />
              </React.Suspense>
            ),
          },
          {
            path: 'dashboard',
            element: (
              <React.Suspense fallback={<LoadingFallback />}>
                <DummyComponent pageName="Dashboard" />
              </React.Suspense>
            ),
          },
          {
            path: 'profile',
            element: (
              <React.Suspense fallback={<LoadingFallback />}>
                <DummyComponent pageName="Profile" />
              </React.Suspense>
            ),
          },
        ],
      },
      
      // Courses routes with specific permissions
      {
        element: <AuthGuard requiredPermissions={['courses:view']} />,
        children: [
          {
            path: 'courses',
            element: (
              <React.Suspense fallback={<LoadingFallback />}>
                <DummyComponent pageName="Course List" />
              </React.Suspense>
            ),
          },
          {
            path: 'courses/:id',
            element: (
              <React.Suspense fallback={<LoadingFallback />}>
                <DummyComponent pageName="Course Details" />
              </React.Suspense>
            ),
          },
        ],
      },
    ],
  },
  
  // Error pages
  {
    path: 'unauthorized',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <DummyComponent pageName="Unauthorized" />
      </React.Suspense>
    ),
  },
  
  // Catch-all route for 404s
  {
    path: '*',
    element: (
      <React.Suspense fallback={<LoadingFallback />}>
        <DummyComponent pageName="Not Found (404)" />
      </React.Suspense>
    ),
  },
];
