import type { Notification } from '@shared/types/notification.types';

/**
 * Base mock notification fields for reuse
 */
const baseNotificationFields = {
  tenant_id: 1,
  sender_id: null,
  scheduled_at: null,
  metadata: null,
  is_read_receipt_required: false,
  target_audience: null,
  is_active: true,
  is_deleted: false,
  created_by: 1,
  updated_by: null,
  deleted_at: null,
  deleted_by: null,
  created_ip: '127.0.0.1',
  updated_ip: null,
};

/**
 * Mock notification data for frontend testing
 * Based on the screenshot UI design
 */
export const mockNotifications: Notification[] = [
  {
    ...baseNotificationFields,
    notification_id: 1,
    title: 'Discuss About The New Task',
    message: 'Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.Lorem ipsum dolor sit amet consectetur. Ac diam at in cursus urna tincidunt quam facilisi etiam.',
    notification_type: 'ANNOUNCEMENT',
    priority: 'NORMAL',
    expires_at: null,
    created_at: '2025-06-10T10:00:00Z',
    updated_at: '2025-06-10T10:00:00Z',
  },
  {
    ...baseNotificationFields,
    notification_id: 2,
    title: 'Discuss About The New Task',
    message: 'Lorem Ipsum Dolor Sit Amet Consectetur. Ac Diam At In Cursus Urna Tincidunt Quam Facilisi Etiam.Lorem Ipsum Dolor Sit Amet Consectetur. Ac Diam At In Cursus Urna Tincidunt Quam Facilisi Etiam.',
    notification_type: 'COURSE_UPDATE',
    priority: 'URGENT',
    expires_at: null,
    created_at: '2025-06-10T10:00:00Z',
    updated_at: '2025-06-10T10:00:00Z',
  },
  {
    ...baseNotificationFields,
    notification_id: 3,
    title: 'Discuss About The New Task',
    message: 'Lorem Ipsum Dolor Sit Amet Consectetur. Ac Diam At In Cursus Urna Tincidunt Quam Facilisi Etiam.Lorem Ipsum Dolor Sit Amet Consectetur. Ac Diam At In Cursus Urna Tincidunt Quam Facilisi Etiam.',
    notification_type: 'COURSE_UPDATE',
    priority: 'HIGH',
    expires_at: null,
    created_at: '2025-06-10T10:00:00Z',
    updated_at: '2025-06-10T10:00:00Z',
  },
  {
    ...baseNotificationFields,
    notification_id: 4,
    title: 'Discuss About The New Task',
    message: 'Lorem Ipsum Dolor Sit Amet Consectetur. Ac Diam At In Cursus Urna Tincidunt Quam Facilisi Etiam.Lorem Ipsum Dolor Sit Amet Consectetur. Ac Diam At In Cursus Urna Tincidunt Quam Facilisi Etiam.',
    notification_type: 'COURSE_UPDATE',
    priority: 'HIGH',
    expires_at: null,
    created_at: '2025-06-10T10:00:00Z',
    updated_at: '2025-06-10T10:00:00Z',
  },
  {
    ...baseNotificationFields,
    notification_id: 5,
    title: 'Assignment Due Tomorrow',
    message: 'Your assignment for React Advanced Concepts is due tomorrow at 11:59 PM. Please make sure to submit your work on time to avoid late penalties.',
    notification_type: 'COURSE_UPDATE',
    priority: 'URGENT',
    is_read_receipt_required: true,
    expires_at: null,
    created_at: '2025-06-09T14:30:00Z',
    updated_at: '2025-06-09T14:30:00Z',
  },
  {
    ...baseNotificationFields,
    notification_id: 6,
    title: 'New Quiz Available',
    message: 'A new quiz for JavaScript Fundamentals has been posted. The quiz will be available until Friday. Good luck!',
    notification_type: 'COURSE_UPDATE',
    priority: 'NORMAL',
    expires_at: '2025-06-15T23:59:59Z',
    created_at: '2025-06-08T09:15:00Z',
    updated_at: '2025-06-08T09:15:00Z',
  },
  {
    ...baseNotificationFields,
    notification_id: 7,
    title: 'Grade Posted for Midterm Exam',
    message: 'Your grade for the Midterm Exam in Database Systems has been posted. You can view your detailed results in the grades section.',
    notification_type: 'ANNOUNCEMENT',
    priority: 'NORMAL',
    metadata: { exam_name: 'Midterm Exam', course: 'Database Systems', grade: 'A-' },
    expires_at: null,
    created_at: '2025-06-07T16:45:00Z',
    updated_at: '2025-06-07T16:45:00Z',
  },
  {
    ...baseNotificationFields,
    notification_id: 8,
    title: 'System Maintenance Scheduled',
    message: 'The LMS platform will undergo scheduled maintenance on Saturday from 2:00 AM to 6:00 AM. The system will be temporarily unavailable during this time.',
    notification_type: 'ANNOUNCEMENT',
    priority: 'HIGH',
    is_read_receipt_required: true,
    expires_at: null,
    created_at: '2025-06-06T11:00:00Z',
    updated_at: '2025-06-06T11:00:00Z',
  },
  {
    ...baseNotificationFields,
    notification_id: 9,
    title: 'Welcome to Advanced Web Development',
    message: 'You have been successfully enrolled in Advanced Web Development. Please check your course materials and schedule.',
    notification_type: 'ANNOUNCEMENT',
    priority: 'NORMAL',
    metadata: { course_name: 'Advanced Web Development', course_code: 'CS401' },
    expires_at: null,
    created_at: '2025-06-05T08:20:00Z',
    updated_at: '2025-06-05T08:20:00Z',
  },
  {
    ...baseNotificationFields,
    notification_id: 10,
    title: 'Class Rescheduled',
    message: 'Your Mobile App Development class scheduled for Wednesday has been moved to Thursday at 2:00 PM. Please update your calendar accordingly.',
    notification_type: 'COURSE_UPDATE',
    priority: 'HIGH',
    metadata: { old_time: 'Wednesday 10:00 AM', new_time: 'Thursday 2:00 PM' },
    is_read_receipt_required: true,
    expires_at: null,
    created_at: '2025-06-04T15:30:00Z',
    updated_at: '2025-06-04T15:30:00Z',
  },
];

/**
 * Mock notification counts for tab display
 * Only All, Unread, and Read tabs are shown
 */
export const mockNotificationCounts = {
  all: mockNotifications.length,
  unread: Math.floor(mockNotifications.length * 0.7), // 70% unread
  read: Math.floor(mockNotifications.length * 0.3), // 30% read
};

/**
 * Get mock notifications with optional filtering
 */
export const getMockNotifications = (params?: {
  status?: 'all' | 'unread' | 'read';
  search?: string;
  notificationType?: string;
  priority?: string;
}): Notification[] => {
  let filtered = [...mockNotifications];

  // Filter by search
  if (params?.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower)
    );
  }

  // Filter by type
  if (params?.notificationType && params.notificationType !== 'all') {
    filtered = filtered.filter((n) => n.notification_type === params.notificationType);
  }

  // Filter by priority
  if (params?.priority && params.priority !== 'all') {
    filtered = filtered.filter((n) => n.priority === params.priority);
  }

  // Filter by status (mock implementation)
  if (params?.status === 'read') {
    // Return 30% of notifications as "read"
    filtered = filtered.slice(0, Math.floor(filtered.length * 0.3));
  } else if (params?.status === 'unread') {
    // Return 70% of notifications as "unread"
    filtered = filtered.slice(0, Math.floor(filtered.length * 0.7));
  }

  return filtered;
};

/**
 * Get a single mock notification by ID
 */
export const getMockNotificationById = (id: number): Notification | null => {
  return mockNotifications.find((n) => n.notification_id === id) || null;
};
