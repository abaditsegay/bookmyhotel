import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/apiConfig';
import { BookingNotification } from './useNotifications';

export interface UseBookingNotificationsResult {
  notifications: BookingNotification[];
  latest: BookingNotification | null;
  history: BookingNotification[]; // Complete history including latest notification
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBookingNotifications = (confirmationNumber: string | null): UseBookingNotificationsResult => {
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!confirmationNumber || !token) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching notifications for confirmation:', confirmationNumber);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/notifications/by-confirmation/${encodeURIComponent(confirmationNumber)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        }
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }

      const data: BookingNotification[] = await response.json();
      console.log('✅ Fetched notifications:', data);
      
      setNotifications(data);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [confirmationNumber, token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Extract latest notification (first in array since it's ordered by created_at DESC)
  const latest = notifications.length > 0 ? notifications[0] : null;
  
  // Extract complete history (all notifications including the latest for complete view)
  const history = notifications;

  return {
    notifications,
    latest,
    history,
    loading,
    error,
    refetch: fetchNotifications,
  };
};