import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface BookingModificationHistory {
  id: number;
  modificationType: string;
  oldValue: string;
  newValue: string;
  additionalCharges: number;
  refundAmount: number;
  changeDetails: string;
  modifiedBy: string;
  createdAt: string;
  confirmationNumber: string;
}

export const useBookingHistory = (confirmationNumber?: string) => {
  const [history, setHistory] = useState<BookingModificationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  const fetchHistory = useCallback(async (confNumber: string) => {
    if (!confNumber || !user?.hotelId || !token) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/booking-history/confirmation/${confNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Hotel-ID': user.hotelId.toString(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No history found, which is normal
          setHistory([]);
          return;
        }
        throw new Error(`Failed to fetch booking history: ${response.status}`);
      }

      const data = await response.json();
      setHistory(data || []);
    } catch (err: any) {
      console.error('Error fetching booking history:', err);
      setError(err.message || 'Failed to fetch booking history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user?.hotelId, token]);

  useEffect(() => {
    if (confirmationNumber) {
      fetchHistory(confirmationNumber);
    }
  }, [confirmationNumber, fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: () => confirmationNumber && fetchHistory(confirmationNumber)
  };
};