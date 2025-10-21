import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { Notification, NotificationType } from '@shared/types/notification.types';
import { FiClock } from 'react-icons/fi';
import clsx from 'clsx';

export interface NoticeCardProps {
  /**
   * The notification data to display
   */
  notice: Notification;
  
  /**
   * Click handler when card is clicked
   */
  onClick?: (noticeId: number) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Animation delay for staggered entrance
   */
  animationDelay?: number;
}

/**
 * NoticeCard - Card component for displaying individual notices
 * 
 * Features:
 * - Display notice title, message preview, and metadata
 * - Visual indicators for priority and type
 * - Unread indicator (red dot)
 * - Smooth animations with Framer Motion
 * - Click to view full details
 * 
 * @param props - Component props
 * @returns JSX.Element
 */
const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onClick,
  className,
  animationDelay = 0,
}) => {
  // Extract relevant data
  const {
    notification_id,
    title,
    message,
    notification_type,
    created_at,
  } = notice;

  // Determine if notice is unread (using mock logic for now)
  // TODO: Replace with actual read status from NotificationDelivery API
  const isUnread = true;

  // Format date
  const formattedDate = format(new Date(created_at), 'MMMM dd, yyyy / hh:mm a');

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

  const badgeStyles = getBadgeStyles(notification_type);

  // Truncate message for preview (first 100 characters)
  const messagePreview = message.length > 150 
    ? `${message.substring(0, 150)}...` 
    : message;

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(notification_id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: animationDelay,
        ease: 'easeOut'
      }}
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      className={clsx(
        'bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-neutral-200',
        'cursor-pointer transition-shadow hover:shadow-md',
        'w-full', // Ensure full width
        className
      )}
    >
      {/* Header with unread indicator and title */}
      <div className="flex items-start mb-3 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Unread indicator */}
          {isUnread && (
            <div className="flex-shrink-0 w-2.5 h-2.5 bg-red-500 rounded-full" />
          )}
          
          {/* Title */}
          <h3 className={clsx(
            'font-heading font-semibold text-base sm:text-lg text-neutral-900 truncate',
            isUnread && 'text-neutral-900'
          )}>
            {title}
          </h3>
        </div>
      </div>

      {/* Message preview */}
      <p className="text-neutral-600 text-sm leading-relaxed mb-3">
        {messagePreview}
      </p>

      {/* Footer with date and badge */}
      <div className="flex items-center justify-between gap-3">
        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <FiClock className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>

        {/* Type badge */}
        <span
          className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            color: badgeStyles.text,
            backgroundColor: badgeStyles.bg
          }}
        >
          {getTypeLabel(notification_type)}
        </span>
      </div>
    </motion.div>
  );
};

export default NoticeCard;
