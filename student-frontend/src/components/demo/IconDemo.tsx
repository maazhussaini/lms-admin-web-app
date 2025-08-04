/**
 * @file components/demo/IconDemo.tsx
 * @description Demo component to showcase all available custom icons
 * Use this component to see what icons are available and choose the right ones for your navigation
 */

import React from 'react';
import CustomIcon from '@/components/common/CustomIcon';

const IconDemo: React.FC = () => {
  // Available icon classes based on the style.css file
  const iconClasses = [
    'ic-1', 'ic-2', 'ic-3', 'ic-4', 'ic-5', 'ic-6', 'ic-7', 'ic-8', 'ic-9', 'ic-10',
    'ic-11', 'ic-12', 'ic-13', 'ic-14', 'ic-15', 'ic-16', 'ic-17', 'ic-18', 'ic-19', 'ic-20', 'ic-21'
  ];

  return (
    <div className="p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Custom Icon Font Demo</h2>
      <p className="text-gray-600 mb-8">
        These are the available custom icons from your IcoMoon font. 
        Choose the appropriate icons for your navigation items and update the iconClass in SideNavBar.tsx.
      </p>
      
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
        {iconClasses.map((iconClass) => (
          <div key={iconClass} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <CustomIcon 
              iconClass={iconClass} 
              className="text-3xl text-gray-700 mb-2" 
              aria-label={iconClass}
            />
            <span className="text-sm text-gray-500 font-mono">{iconClass}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Usage Instructions:</h3>
        <ol className="text-blue-700 space-y-1">
          <li>1. Look at the icons above and identify which ones match your navigation needs</li>
          <li>2. Update the iconClass values in SideNavBar.tsx (currently using ic-1, ic-2, ic-3, ic-4, ic-5)</li>
          <li>3. Common suggestions:</li>
          <ul className="ml-4 mt-1 space-y-1">
            <li>• Calendar: Look for a calendar-like icon</li>
            <li>• Chat: Look for a speech bubble or message icon</li>
            <li>• Courses: Look for a play button, book, or education icon</li>
            <li>• Settings: Look for a gear or cog icon</li>
            <li>• Logout: Look for an exit or arrow icon</li>
          </ul>
        </ol>
      </div>
    </div>
  );
};

export default IconDemo;
