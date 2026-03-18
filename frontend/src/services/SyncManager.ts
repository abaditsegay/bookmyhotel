/**
 * Synchronization Service for syncing offline bookings with the server when connectivity is restored
 */

import { buildApiUrl, API_ENDPOINTS } from '../config/apiConfig';
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
        hotelId: booking.hotelId,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        roomType: booking.roomType,
        roomId: booking.roomId,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        guests: booking.numberOfGuests,
        paymentMethodId: booking.paymentMethod === 'CASH' ? 'pay_at_frontdesk' : booking.paymentMethod,
        specialRequests: booking.specialRequests
      };

      const response = await fetch(buildApiUrl(API_ENDPOINTS.BOOKINGS.WALK_IN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Hotel-ID': booking.hotelId.toString()
        },
        body: JSON.stringify(walkInBookingRequest)
      });

      if (response.ok) {
        await offlineStorage.updateBookingStatus(booking.id, 'SYNCED');
        return { success: true };
      } else {
        const errorText = await response.text();
        await offlineStorage.updateBookingStatus(booking.id, 'SYNC_FAILED', `HTTP ${response.status}: ${errorText}`);
        return { success: false, error: errorText };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await offlineStorage.updateBookingStatus(booking.id, 'SYNC_FAILED', errorMessage);
      return { success: false, error: errorMessage };
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
        } catch (error) {
          // console.warn('Failed to cleanup orphaned guests:', error);
        }
      }

    } catch (error) {
      // console.error('Sync process failed:', error);
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
    
    // Debug logging to understand the issue
    // console.debug(`📊 Sync Status Debug:
    // - Total bookings: ${bookings.length}
    // - Pending: ${pendingCount}
    // - Synced: ${syncedBookings.length}  
    // - Failed: ${failedBookings.length}
    // - Failed booking IDs: [${failedBookings.map(b => b.id).join(', ')}]`);
    
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
    
    // console.log(`🔄 Retrying ${toRetry.length} failed bookings`);
    
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
        // console.log(`🔄 Retrying booking ${booking.id}...`);
        
        // First, reset the booking status to PENDING_SYNC
        await offlineStorage.updateBookingStatus(booking.id, 'PENDING_SYNC');
        
        // Now attempt to sync (this will either mark as SYNCED or SYNC_FAILED)
        const response = await this.syncSingleBooking(booking, token);
        if (response.success) {
          results.syncedCount++;
          // console.log(`✅ Successfully synced booking ${booking.id} on retry`);
        } else {
          results.failedCount++;
          results.errors.push({
            bookingId: booking.id,
            error: response.error || 'Unknown error'
          });
          // console.log(`❌ Booking ${booking.id} failed again: ${response.error}`);
        }
      } catch (error) {
        results.failedCount++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({
          bookingId: booking.id,
          error: `Failed to sync booking ${booking.id}: ${errorMessage}`
        });
        // console.error(`❌ Exception during retry of booking ${booking.id}:`, error);
        
        // Mark booking as failed with error details
        await offlineStorage.updateBookingStatus(booking.id, 'SYNC_FAILED', errorMessage);
      }
    }

    // console.log(`🔄 Retry completed: ${results.syncedCount} synced, ${results.failedCount} still failed`);
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
      // console.log(`🧹 Manual cleanup: Removed ${cleanedCount} orphaned guest records`);
      return cleanedCount;
    } catch (error) {
      // console.error('Failed to cleanup orphaned guests:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const syncManager = new SyncManager();

// Export types
export type { SyncResult };
