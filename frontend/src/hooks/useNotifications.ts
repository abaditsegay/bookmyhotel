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
  updatedBy?: string;
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
  const { token, isInitializing, hasRole } = useAuth();
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
      
      // Skip notifications for system admin users - they don't have access
      if (hasRole('SYSTEM_ADMIN')) {
        console.log('🔑 System admin detected - skipping notifications API call');
        setNotifications([]);
        setStats({ totalUnread: 0, unreadCancellations: 0, unreadModifications: 0 });
        setLoading(false);
        return;
      }
      
      // Only load notifications for HOTEL_ADMIN and FRONTDESK roles
      if (!hasRole('HOTEL_ADMIN') && !hasRole('FRONTDESK')) {
        console.log('🚫 User does not have required role for notifications');
        setNotifications([]);
        setStats({ totalUnread: 0, unreadCancellations: 0, unreadModifications: 0 });
        setLoading(false);
        return;
      }
      
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
  }, [hasRole]);

  const markAsRead = async (notificationId: number) => {
    // Skip for system admin or users without proper roles
    if (hasRole('SYSTEM_ADMIN') || (!hasRole('HOTEL_ADMIN') && !hasRole('FRONTDESK'))) {
      console.log('🚫 User does not have permission to mark notifications as read');
      return false;
    }
    
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
    // Skip for system admin or users without proper roles
    if (hasRole('SYSTEM_ADMIN') || (!hasRole('HOTEL_ADMIN') && !hasRole('FRONTDESK'))) {
      console.log('🚫 User does not have permission to mark all notifications as read');
      return false;
    }
    
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
    // Skip for system admin or users without proper roles
    if (hasRole('SYSTEM_ADMIN') || (!hasRole('HOTEL_ADMIN') && !hasRole('FRONTDESK'))) {
      console.log('🚫 User does not have permission to archive notifications');
      return false;
    }
    
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
    // Skip for system admin or users without proper roles
    if (hasRole('SYSTEM_ADMIN') || (!hasRole('HOTEL_ADMIN') && !hasRole('FRONTDESK'))) {
      return 0;
    }
    
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

  // Event-based refresh: Refresh when user returns to the page/tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !loading && token) {
        // Refresh notifications when user returns to the tab
        loadNotifications();
      }
    };

    const handleFocus = () => {
      if (!loading && token) {
        // Refresh notifications when window gains focus
        loadNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadNotifications, loading, token]);

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

// Custom event system for triggering notification refreshes
class NotificationEventEmitter {
  private static instance: NotificationEventEmitter;
  private listeners: Set<() => void> = new Set();

  static getInstance(): NotificationEventEmitter {
    if (!NotificationEventEmitter.instance) {
      NotificationEventEmitter.instance = new NotificationEventEmitter();
    }
    return NotificationEventEmitter.instance;
  }

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  emit(action?: 'cancel' | 'modify' | 'create' | 'update'): void {
    console.log(`🔄 NotificationEventEmitter: Triggering refresh${action ? ` after booking ${action}` : ''}`);
    
    // Add a small delay to ensure backend has processed the changes
    setTimeout(() => {
      this.listeners.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in notification refresh callback:', error);
        }
      });
    }, action ? 1000 : 0); // 1 second delay for booking actions, immediate for manual refresh
  }
}

export const notificationEventEmitter = NotificationEventEmitter.getInstance();

/**
 * Enhanced hook that listens for booking-related events to refresh notifications
 * Use this in components that need automatic refresh when bookings change
 */
export const useNotificationsWithEvents = () => {
  const notificationsData = useNotifications();

  useEffect(() => {
    const unsubscribe = notificationEventEmitter.subscribe(notificationsData.loadNotifications);
    return unsubscribe;
  }, [notificationsData.loadNotifications]);

  return {
    ...notificationsData,
    triggerRefresh: () => notificationEventEmitter.emit(),
    triggerRefreshAfterBookingAction: (action: 'cancel' | 'modify' | 'create' | 'update') => 
      notificationEventEmitter.emit(action)
  };
};

export default useNotifications;