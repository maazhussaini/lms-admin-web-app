import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NoticeCard, NotificationSelector } from '@/components/features/NoticeBoard';
import { useNotifications } from '@/hooks/useNotifications';
import Spinner from '@/components/common/Spinner';

/**
 * NoticeBoardPage - Main notice board page with tabs
 * 
 * Features:
 * - Tab navigation for different notice statuses (All, Unread, Read)
 * - Grid layout of notice cards
 * - Empty states for no results
 * - Loading and error states
 * 
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 * 
 * @returns JSX.Element
 */
const NoticeBoardPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch notifications with filters
  const {
    notifications,
    notificationCounts,
    filters,
    loading,
    error,
    updateStatus,
    refetch,
  } = useNotifications();

  // Handle tab change
  const handleTabChange = (tabId: 'all' | 'unread' | 'read') => {
    updateStatus(tabId);
  };

  // Handle notice card click
  const handleNoticeClick = (noticeId: number) => {
    navigate(`/notices/${noticeId}`);
  };

  // Handle retry
  const handleRetry = () => {
    refetch();
  };

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full flex items-center justify-center"
      >
        <div className="text-center py-12 px-6 max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Unable to Load Notices
            </h2>
            <p className="text-neutral-600">
              {error.message || 'An unexpected error occurred while loading notices.'}
            </p>
          </div>
          <button
            onClick={handleRetry}
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Notification Selector */}
      <div className="mb-6 flex-shrink-0">
        <NotificationSelector
          activeTab={filters.status}
          onTabChange={handleTabChange}
          counts={notificationCounts}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {/* Notices List */}
      {!loading && notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {notifications.map((notice, index) => (
            <NoticeCard
              key={notice.notification_id}
              notice={notice}
              onClick={handleNoticeClick}
              animationDelay={index * 0.05}
            />
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && notifications.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex items-center justify-center"
        >
          <div className="text-center py-12 px-6 max-w-md">
            <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-16 h-16 text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-heading text-primary-800 mb-2">
              No Notices To Display.
            </h2>
            <p className="text-neutral-600 text-lg">
              Check Back Later!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default NoticeBoardPage;
