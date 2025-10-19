/**
 * @file hooks/useNotifications.ts
 * @description Custom hook for fetching and managing notifications
 */

import { useState, useMemo, useEffect } from 'react';
import { useApiList } from './useApi';
import type { 
  Notification, 
  NotificationType, 
  NotificationPriority 
} from '@shared/types/notification.types';
import { 
  getMockNotifications, 
  mockNotificationCounts 
} from '@/pages/NoticeBoardPage/mockNotifications';

// Flag to use mock data (set to true for frontend testing)
const USE_MOCK_DATA = true;

/**
 * Filter options for notifications
 */
export interface NotificationFilters {
  status: 'all' | 'unread' | 'read';
  type?: NotificationType | 'all';
  priority?: NotificationPriority | 'all';
  search?: string;
}

/**
 * Hook for managing notifications with filtering and pagination
 * 
 * @param studentId - The student ID to fetch notifications for
 * @returns Notification data, loading state, error state, and filter controls
 */
export function useNotifications(studentId?: number) {
  // Filter state
  const [filters, setFilters] = useState<NotificationFilters>({
    status: 'all',
    type: 'all',
    priority: 'all',
    search: '',
  });

  // Build API query parameters (only when not using mock data)
  const queryParams = useMemo(() => {
    // Don't build params if using mock data
    if (USE_MOCK_DATA) {
      return {};
    }

    const params: Record<string, any> = {
      page: 1,
      limit: 20,
    };

    if (studentId) {
      params.studentId = studentId;
    }

    if (filters.search) {
      params.search = filters.search;
    }

    if (filters.type && filters.type !== 'all') {
      params.notificationType = filters.type;
    }

    if (filters.priority && filters.priority !== 'all') {
      params.priority = filters.priority;
    }

    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    return params;
  }, [USE_MOCK_DATA, studentId, filters]);

  // Mock data state for frontend testing
  const [mockData, setMockData] = useState<Notification[]>([]);
  const [mockLoading, setMockLoading] = useState(true);

  // Simulate API call with mock data
  useEffect(() => {
    if (!USE_MOCK_DATA) return;

    setMockLoading(true);
    // Simulate network delay
    const timer = setTimeout(() => {
      const filtered = getMockNotifications({
        status: filters.status,
        search: filters.search,
        notificationType: filters.type !== 'all' ? filters.type : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
      });
      setMockData(filtered);
      setMockLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  // Real API call (will be used when backend is ready)
  const {
    data: apiNotifications,
    pagination,
    loading: apiLoading,
    error,
    refetch: apiRefetch,
    goToPage,
    search: searchFn,
  } = useApiList<Notification>('/notifications', queryParams, {
    immediate: !USE_MOCK_DATA, // Only call API if not using mock data
  });

  // Use mock data or real API data
  const notifications = USE_MOCK_DATA ? mockData : apiNotifications;
  const loading = USE_MOCK_DATA ? mockLoading : apiLoading;
  const refetch = USE_MOCK_DATA ? () => setMockData(getMockNotifications()) : apiRefetch;

  // Calculate notification counts by status
  const notificationCounts = useMemo(() => {
    if (USE_MOCK_DATA) {
      return mockNotificationCounts;
    }
    // Real API counts
    return {
      all: notifications.length,
      unread: Math.floor(notifications.length * 0.7),
      read: Math.floor(notifications.length * 0.25),
      expired: Math.floor(notifications.length * 0.05),
    };
  }, [notifications]);

  // Filter update handlers
  const updateStatus = (status: NotificationFilters['status']) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const updateType = (type: NotificationType | 'all') => {
    setFilters((prev) => ({ ...prev, type }));
  };

  const updatePriority = (priority: NotificationPriority | 'all') => {
    setFilters((prev) => ({ ...prev, priority }));
  };

  const updateSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
    searchFn(search);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      priority: 'all',
      search: '',
    });
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.status !== 'all' ||
      (filters.type && filters.type !== 'all') ||
      (filters.priority && filters.priority !== 'all') ||
      !!filters.search
    );
  }, [filters]);

  return {
    // Data
    notifications,
    pagination,
    notificationCounts,

    // State
    filters,
    loading,
    error,
    hasActiveFilters,

    // Filter controls
    updateStatus,
    updateType,
    updatePriority,
    updateSearch,
    clearFilters,

    // Pagination
    goToPage,

    // Actions
    refetch,
  };
}

/**
 * Hook for fetching a single notification detail
 * 
 * @param notificationId - The notification ID to fetch
 * @returns Notification data, loading state, error state
 */
export function useNotificationDetail(notificationId: number) {
  const { data, loading, error, refetch } = useApiList<Notification>(
    `/notifications/${notificationId}`,
    {
      immediate: true,
    }
  );

  return {
    notification: data[0] || null,
    loading,
    error,
    refetch,
  };
}
