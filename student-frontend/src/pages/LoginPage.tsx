import React from 'react';

/**
 * Dummy page component for development purposes
 */
const DummyPage = ({ pageName, description }: { pageName: string; description: string }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageName}</h1>
        <p className="text-gray-600 mb-8">{description}</p>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-sm text-gray-500 mb-4">
            📍 Current Path: <code className="bg-gray-100 px-2 py-1 rounded">{window.location.pathname}</code>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-700">This is a temporary placeholder component.</p>
            <p className="text-sm text-gray-700">The actual {pageName.toLowerCase()} implementation will be added later.</p>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a href="/login" className="text-blue-600 hover:text-blue-800 underline">Login</a>
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800 underline">Dashboard</a>
              <a href="/courses" className="text-blue-600 hover:text-blue-800 underline">Courses</a>
              <a href="/profile" className="text-blue-600 hover:text-blue-800 underline">Profile</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Login page component - temporary dummy implementation
 */
const LoginPage: React.FC = () => (
  <DummyPage 
    pageName="Login Page" 
    description="Student authentication portal - sign in to access your courses and materials."
  />
);

export default LoginPage;
