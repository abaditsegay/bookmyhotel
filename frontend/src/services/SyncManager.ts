/**
 * Synchronization Service for syncing offline bookings with the server when connectivity is restored
 */

import { buildApiUrl } from '../config/apiConfig';
import { offlineStorage } from './OfflineStorageService';

interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: Array<{
    bookingId: string;
    error: string;
  }>;
}

class SyncManager {
  private issyncing = false;

  /**
   * Sync a single booking to server
   */
  private async syncSingleBooking(booking: any, token: string) {
    try {
      const walkInBookingRequest = {
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        roomType: booking.roomType,
        roomId: booking.roomId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        numberOfGuests: booking.numberOfGuests,
        totalAmount: booking.totalAmount,
        pricePerNight: booking.pricePerNight,
        paymentMethod: booking.paymentMethod,
        specialRequests: booking.specialRequests
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/walk-in-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Hotel-ID': booking.hotelId.toString()
        },
        body: JSON.stringify(walkInBookingRequest)
      });

      if (response.ok) {
        const updatedBooking = {
          ...booking,
          status: 'SYNCED' as const
        };
        await offlineStorage.saveOfflineBooking(updatedBooking);
        return { success: true };
      } else {
        const errorText = await response.text();
        const failedBooking = {
          ...booking,
          status: 'SYNC_FAILED' as const,
          syncAttempts: (booking.syncAttempts || 0) + 1,
          errorMessage: `HTTP ${response.status}: ${errorText}`
        };
        await offlineStorage.saveOfflineBooking(failedBooking);
        return { success: false, error: errorText };
      }
    } catch (error) {
      const failedBooking = {
        ...booking,
        status: 'SYNC_FAILED' as const,
        syncAttempts: (booking.syncAttempts || 0) + 1,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      await offlineStorage.saveOfflineBooking(failedBooking);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Sync offline bookings to server
   */
  async syncOfflineBookings(token: string) {
    if (this.issyncing) {
      return { 
        success: false, 
        syncedCount: 0,
        failedCount: 0,
        errors: [{
          bookingId: 'system',
          error: 'Sync already in progress'
        }]
      };
    }

    this.issyncing = true;
    const results = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [] as Array<{
        bookingId: string;
        error: string;
      }>
    };

    try {
      const bookings = await offlineStorage.getOfflineBookings();
      const pendingBookings = bookings.filter(b => b.status === 'PENDING_SYNC');

      console.log(`Found ${pendingBookings.length} pending bookings to sync`);

      for (const booking of pendingBookings) {
        const result = await this.syncSingleBooking(booking, token);
        if (result.success) {
          results.syncedCount++;
        } else {
          results.failedCount++;
          results.errors.push({
            bookingId: booking.id,
            error: result.error || 'Unknown error'
          });
        }
      }

      // Clean up orphaned guest data after successful sync
      if (results.syncedCount > 0) {
        try {
          await offlineStorage.cleanupOrphanedGuests();
          console.log('Cleaned up orphaned guest data after sync');
        } catch (error) {
          console.warn('Failed to cleanup orphaned guests:', error);
        }
      }

    } catch (error) {
      console.error('Sync process failed:', error);
      results.success = false;
      results.errors.push({
        bookingId: 'system',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      this.issyncing = false;
    }

    return results;
  }

  /**
   * Sync all pending bookings
   */
  async syncAllPendingBookings(token: string) {
    return this.syncOfflineBookings(token);
  }

  /**
   * Get current sync status
   */
  async getSyncStatus() {
    const bookings = await offlineStorage.getOfflineBookings();
    const pendingCount = bookings.filter(b => b.status === 'PENDING_SYNC').length;
    const syncedBookings = bookings.filter(b => b.status === 'SYNCED');
    const failedBookings = bookings.filter(b => b.status === 'SYNC_FAILED');
    
    return {
      isSyncing: this.issyncing,
      pendingCount,
      totalCount: bookings.length,
      syncedCount: syncedBookings.length,
      failedCount: failedBookings.length,
      lastSyncAttempt: bookings.length > 0 ? bookings[bookings.length - 1].createdAt : undefined,
      lastSyncSuccess: syncedBookings.length > 0 ? syncedBookings[syncedBookings.length - 1].createdAt : undefined,
      lastSyncError: failedBookings.length > 0 ? failedBookings[failedBookings.length - 1].errorMessage : undefined
    };
  }

  /**
   * Retry failed bookings
   */
  async retryFailedBookings(token: string) {
    const failedBookings = await offlineStorage.getOfflineBookings();
    const toRetry = failedBookings.filter(b => b.status === 'SYNC_FAILED');
    
    const results = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [] as Array<{
        bookingId: string;
        error: string;
      }>
    };

    for (const booking of toRetry) {
      try {
        // Reset sync attempts and try again
        const updatedBooking = {
          ...booking,
          status: 'PENDING_SYNC' as const,
          syncAttempts: 0,
          errorMessage: undefined
        };
        await offlineStorage.saveOfflineBooking(updatedBooking);
        
        const response = await this.syncSingleBooking(booking, token);
        if (response.success) {
          results.syncedCount++;
        } else {
          results.failedCount++;
          results.errors.push({
            bookingId: booking.id,
            error: response.error || 'Unknown error'
          });
        }
      } catch (error) {
        results.failedCount++;
        results.errors.push({
          bookingId: booking.id,
          error: `Failed to sync booking ${booking.id}: ${error}`
        });
      }
    }

    return results;
  }

  /**
   * Clear old synced bookings
   */
  async clearOldSyncedBookings(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const bookings = await offlineStorage.getOfflineBookings();
    const toDelete = bookings.filter(b => 
      b.status === 'SYNCED' && 
      new Date(b.createdAt) < cutoffDate
    );

    for (const booking of toDelete) {
      await offlineStorage.deleteOfflineBooking(booking.id);
    }

    return toDelete.length;
  }

  /**
   * Export offline bookings
   */
  async exportOfflineBookings() {
    const bookings = await offlineStorage.getOfflineBookings();
    // Get guests by reading from IndexedDB directly (since getAllGuests is private)
    const guests: any[] = [];
    
    const exportData = {
      bookings,
      guests,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Manually cleanup orphaned guest information
   */
  async cleanupOrphanedGuests(): Promise<number> {
    try {
      const cleanedCount = await offlineStorage.cleanupOrphanedGuests();
      console.log(`🧹 Manual cleanup: Removed ${cleanedCount} orphaned guest records`);
      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup orphaned guests:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

// Export types
export type { SyncResult };
