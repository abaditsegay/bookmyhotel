import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../contexts/AuthContext';

export interface BookingNotification {
  id: number;
  reservationId: number;
  type: 'CANCELLED' | 'MODIFIED';
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  confirmationNumber: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  cancellationReason?: string;
  changeDetails?: string;
  additionalCharges?: number;
  refundAmount?: number;
  createdAt: string;
}

export interface NotificationStats {
  totalUnread: number;
  unreadCancellations: number;
  unreadModifications: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export const useNotifications = () => {
  const { token, isInitializing } = useAuth();
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ 
    totalUnread: 0, 
    unreadCancellations: 0, 
    unreadModifications: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStats = (notificationList: BookingNotification[]) => {
    const unread = notificationList.filter(n => n.status === 'UNREAD');
    const unreadCancellations = unread.filter(n => n.type === 'CANCELLED').length;
    const unreadModifications = unread.filter(n => n.type === 'MODIFIED').length;
    
    return {
      totalUnread: unread.length,
      unreadCancellations,
      unreadModifications
    };
  };

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<PaginatedResponse<BookingNotification>>('/notifications');
      
      if (response.success && response.data) {
        // Extract notifications from the paginated response
        const notificationList = response.data.content || [];
        setNotifications(notificationList);
        setStats(calculateStats(notificationList));
      } else {
        throw new Error(response.error || 'Failed to load notifications');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load notifications';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark as read');
      }
      
      // Update local state
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId ? { ...n, status: 'READ' as const } : n
        );
        setStats(calculateStats(updated));
        return updated;
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to mark as read';
      setError(errorMessage);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await apiClient.put('/notifications/mark-all-read');
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark all as read');
      }
      
      // Update local state
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, status: 'READ' as const }));
        setStats(calculateStats(updated));
        return updated;
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to mark all as read';
      setError(errorMessage);
      return false;
    }
  };

  const archiveNotification = async (notificationId: number) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/archive`);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to archive notification');
      }
      
      // Update local state
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId ? { ...n, status: 'ARCHIVED' as const } : n
        );
        setStats(calculateStats(updated));
        return updated;
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to archive notification';
      setError(errorMessage);
      return false;
    }
  };

  const getUnreadCount = async (): Promise<number> => {
    try {
      const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
      
      if (response.success && response.data) {
        return response.data.count;
      }
      return 0;
    } catch (err) {
      console.warn('Failed to get unread count:', err);
      return 0;
    }
  };

  // Load notifications on hook initialization and when user changes
  useEffect(() => {
    // Wait for auth initialization to complete and ensure we have a token
    if (!isInitializing && token) {
      loadNotifications();
    } else if (!isInitializing && !token) {
      // No token available - user needs to log in
      setLoading(false);
      setError('Authentication required');
    }
  }, [loadNotifications, isInitializing, token]);

  // Reload notifications every 30 seconds to keep data fresh
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadNotifications]);

  return {
    notifications,
    stats,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    getUnreadCount,
    setError
  };
};

export default useNotifications;