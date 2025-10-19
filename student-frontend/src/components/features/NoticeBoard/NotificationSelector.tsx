import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export interface NotificationSelectorProps {
  /** Current active tab */
  activeTab: 'all' | 'unread' | 'read';
  /** Handler for tab change */
  onTabChange: (tab: 'all' | 'unread' | 'read') => void;
  /** Notification counts for each category */
  counts: {
    all: number;
    unread: number;
    read: number;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * NotificationSelector - Tab selector component for filtering notifications
 * 
 * Displays three tabs: All, Unread, and Read with notification counts.
 * Features smooth animations and follows the LMS design system.
 * Matches the CourseSelector design pattern.
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const NotificationSelector: React.FC<NotificationSelectorProps> = ({
  activeTab,
  onTabChange,
  counts,
  className
}) => {
  const tabs = [
    {
      key: 'all' as const,
      label: 'All',
      count: counts.all
    },
    {
      key: 'unread' as const,
      label: 'Unread',
      count: counts.unread
    },
    {
      key: 'read' as const,
      label: 'Read',
      count: counts.read
    }
  ];

  return (
    <div 
      className={clsx(
        'flex flex-col sm:flex-row bg-white rounded-[15px] p-1.5 w-full sm:w-auto sm:min-w-[400px] laptop:min-w-[380px] xl:min-w-[480px] shadow-sm border border-neutral-200 gap-1.5 sm:gap-0 flex-shrink-0',
        className
      )}
      role="tablist"
      aria-label="Notification filter tabs"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.key}-notifications-panel`}
            onClick={() => onTabChange(tab.key)}
            className={clsx(
              'relative flex-1 px-6 sm:px-8 laptop:px-6 xl:px-10 py-3.5 sm:py-4 laptop:py-3 xl:py-5 rounded-[15px] font-semibold text-sm sm:text-base laptop:text-sm xl:text-lg transition-all duration-200 ease-in-out cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'hover:scale-[1.02] active:scale-[0.98]',
              {
                'text-white bg-primary-900 shadow-lg': isActive,
                'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100': !isActive
              }
            )}
          >
            {/* Active tab background animation */}
            {isActive && (
              <motion.div
                layoutId="activeNotificationTab"
                className="absolute inset-0 bg-primary-900 rounded-[15px] shadow-lg"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
            
            {/* Tab content */}
            <span className="relative z-10 flex items-center justify-center gap-1.5 sm:gap-2.5 laptop:gap-2 xl:gap-3 w-full">
              <span className="truncate font-medium">
                {tab.label}
              </span>
              <span 
                className={clsx(
                  'inline-flex items-center justify-center min-w-[22px] sm:min-w-[24px] laptop:min-w-[22px] xl:min-w-[28px] h-5 sm:h-6 laptop:h-5 xl:h-7 px-1.5 sm:px-2 laptop:px-1.5 xl:px-2.5 rounded-full text-xs sm:text-sm laptop:text-xs xl:text-base font-bold flex-shrink-0',
                  {
                    'bg-white/20 text-white': isActive,
                    'bg-neutral-300 text-neutral-700': !isActive
                  }
                )}
              >
                {String(tab.count).padStart(2, '0')}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default NotificationSelector;
