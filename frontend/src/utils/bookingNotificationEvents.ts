import { notificationEventEmitter } from '../hooks/useNotifications';

/**
 * Utility functions to trigger notification refreshes after booking-related actions
 * Use these in booking management components to ensure notifications stay up-to-date
 */
export const BookingNotificationEvents = {
  /**
   * Call this after a booking is cancelled
   */
  afterCancellation: () => {
    notificationEventEmitter.emit('cancel');
  },

  /**
   * Call this after a booking is modified
   */
  afterModification: () => {
    notificationEventEmitter.emit('modify');
  },

  /**
   * Call this after a new booking is created
   */
  afterCreation: () => {
    notificationEventEmitter.emit('create');
  },

  /**
   * Call this after any booking update
   */
  afterUpdate: () => {
    notificationEventEmitter.emit('update');
  },

  /**
   * Call this to manually trigger a notification refresh
   */
  refresh: () => {
    notificationEventEmitter.emit();
  }
};

export default BookingNotificationEvents;