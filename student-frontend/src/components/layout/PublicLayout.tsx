import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PublicLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * Layout component for public pages
 * Provides consistent styling and meta information for public routes
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ 
  children, 
  title = "Student LMS Portal",
  description = "Learning Management System for Students"
}) => {
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </>
  );
};
