/**
 * @file pages/IconTestPage.tsx
 * @description Test page to preview custom icons and help choose the right ones for navigation
 * Add this to your routes temporarily to see all available icons
 */

import React from 'react';
import IconDemo from '@/components/demo/IconDemo';

const IconTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <IconDemo />
      </div>
    </div>
  );
};

export default IconTestPage;
