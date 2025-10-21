import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import Spinner from '@/components/common/Spinner';
import type { Notification, NotificationType } from '@shared/types/notification.types';
import { useApiItem } from '@/hooks/useApi';
import CustomIcon from '@/components/common/CustomIcon';
import { getMockNotificationById } from '@/pages/NoticeBoardPage/mockNotifications';

// Mock data flag - should match the one in useNotifications
const USE_MOCK_DATA = true;

/**
 * NoticeDetailPage - Detailed view of a single notice
 * 
 * Features:
 * - Full notice details with title, message, and metadata
 * - Back navigation to notice board
 * - Visual indicators for type and priority
 * - Formatted date and time display
 * - Loading and error states
 * 
 * Security: This page is protected and must be wrapped in StudentGuard at the route level.
 * 
 * @returns JSX.Element
 */
const NoticeDetailPage: React.FC = () => {
  const { noticeId } = useParams<{ noticeId: string }>();
  const navigate = useNavigate();

  // Parse noticeId to number
  const noticeIdNum = noticeId ? parseInt(noticeId) : 0;

  // Always call hooks (React rule)
  const apiResult = useApiItem<Notification>(
    `/notifications/${noticeIdNum}`,
    { immediate: !USE_MOCK_DATA } // Only fetch if not using mock data
  );

  // Get notification data (mock or API)
  const notice = USE_MOCK_DATA 
    ? getMockNotificationById(noticeIdNum) 
    : apiResult.data;
  
  const loading = USE_MOCK_DATA ? false : apiResult.loading;
  const error = USE_MOCK_DATA 
    ? (notice ? null : new Error('Notice not found in mock data'))
    : apiResult.error;

  // Handle back navigation
  const handleBack = () => {
    navigate('/notices');
  };

  // Get badge styles - only General and Class Specific
  const getBadgeStyles = (type: NotificationType): { text: string; bg: string } => {
    // COURSE_UPDATE = Class Specific (green)
    if (type === 'COURSE_UPDATE') {
      return {
        text: '#0E6100',
        bg: '#EFFFED'
      };
    }
    // ANNOUNCEMENT = General (blue)
    return {
      text: '#5FAAFF',
      bg: '#EDF5FF'
    };
  };

  // Get badge label - only "General" or "Class Specific"
  const getTypeLabel = (type: NotificationType): string => {
    return type === 'COURSE_UPDATE' ? 'Class Specific' : 'General';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !notice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
              Notice Not Found
            </h2>
            <p className="text-neutral-600 mb-6">
              {error?.message || 'The notice you are looking for does not exist.'}
            </p>
          </div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Back to Notice Board
          </button>
        </div>
      </div>
    );
  }

  // Format date
  const formattedDate = format(new Date(notice.created_at), 'MMMM dd, yyyy / hh:mm a');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col"
    >
      {/* Notice Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-2xl p-6 sm:p-8"
      >
        {/* Back Button and Title */}
        <div className="flex items-start gap-4 mb-6">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center hover:bg-primary-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer"
            aria-label="Back to Notice Board"
          >
            <FiArrowLeft className="w-5 h-5 text-primary-600" />
          </button>
          
          {/* Title */}
          <div className="flex-1 min-w-0 pt-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900">
              {notice.title}
            </h1>
          </div>
        </div>

        {/* Date and Metadata */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <FiClock className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          {/* Type badge */}
          <span
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              color: getBadgeStyles(notice.notification_type).text,
              backgroundColor: getBadgeStyles(notice.notification_type).bg
            }}
          >
            {getTypeLabel(notice.notification_type)}
          </span>
        </div>

        {/* Notice Details Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">
            Notice Details
          </h2>
          <div className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
            {notice.message}
          </div>
        </div>

        {/* Additional Metadata (if any) */}
        {/* {notice.metadata && Object.keys(notice.metadata).length > 0 && (
          <div className="bg-neutral-50 rounded-xl p-4">
            <h3 className="text-sm font-medium text-neutral-700 mb-2">
              Additional Information
            </h3>
            <pre className="text-xs text-neutral-600 overflow-x-auto">
              {JSON.stringify(notice.metadata, null, 2)}
            </pre>
          </div>
        )} */}
      </motion.div>
    </motion.div>
  );
};

export default NoticeDetailPage;
