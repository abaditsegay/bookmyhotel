import { STATUS_COLORS, StatusColorType } from '../theme/colorConstants';

/**
 * Get Material-UI color for booking status following the booked = blue pattern
 * @param status - Booking status string
 * @returns Material-UI color name for Chip component
 */
export const getBookingStatusColor = (status: string): StatusColorType | 'default' => {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case 'BOOKED':
      return STATUS_COLORS.BOOKED; // 'primary' = blue
    case 'PENDING':
      return STATUS_COLORS.PENDING;   // 'warning' = orange
    case 'CANCELLED':
      return STATUS_COLORS.CANCELLED; // 'error' = red
    case 'CHECKED_IN':
    case 'CHECKEDIN':
      return STATUS_COLORS.CHECKED_IN; // 'success' = green
    case 'CHECKED_OUT':
    case 'CHECKEDOUT':
      return STATUS_COLORS.CHECKED_OUT; // 'info' = light blue
    default:
      return 'default';
  }
};

/**
 * Get Material-UI color for payment status
 * @param status - Payment status string
 * @returns Material-UI color name for Chip component
 */
export const getPaymentStatusColor = (status: string): StatusColorType | 'default' => {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case 'PAID':
    case 'COMPLETED':
    case 'SUCCESS':
      return STATUS_COLORS.PAID;
    case 'PROCESSING':
    case 'PENDING':
      return STATUS_COLORS.PROCESSING;
    case 'FAILED':
    case 'DECLINED':
    case 'ERROR':
      return STATUS_COLORS.FAILED;
    case 'REFUNDED':
    case 'REFUND':
      return STATUS_COLORS.REFUNDED;
    default:
      return 'default';
  }
};

/**
 * Get shop order status color
 * @param status - Shop order status string
 * @returns Material-UI color name for Chip component
 */
export const getShopOrderStatusColor = (status: string): StatusColorType | 'default' => {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case 'BOOKED':
    case 'PAID':
      return STATUS_COLORS.BOOKED; // Blue
    case 'PREPARING':
    case 'PROCESSING':
      return STATUS_COLORS.PROCESSING; // Orange
    case 'READY':
      return STATUS_COLORS.CHECKED_IN; // Green
    case 'DELIVERED':
    case 'COMPLETED':
      return STATUS_COLORS.PAID; // Green
    case 'CANCELLED':
      return STATUS_COLORS.CANCELLED; // Red
    default:
      return 'default';
  }
};

/**
 * Get legacy status color for backward compatibility
 * This function maintains the old green = confirmed pattern for components not yet updated
 * @param status - Status string
 * @returns Material-UI color name
 */
export const getLegacyStatusColor = (status: string): StatusColorType | 'default' => {
  const normalizedStatus = status.toUpperCase();
  switch (normalizedStatus) {
    case 'BOOKED':
      return 'success'; // Green (legacy pattern)
    case 'PENDING':
      return STATUS_COLORS.PENDING;
    case 'CANCELLED':
      return STATUS_COLORS.CANCELLED;
    case 'CHECKED_IN':
    case 'CHECKEDIN':
      return STATUS_COLORS.CHECKED_IN;
    case 'CHECKED_OUT':
    case 'CHECKEDOUT':
      return STATUS_COLORS.CHECKED_OUT;
    default:
      return 'default';
  }
};

/**
 * Check if component should use new color pattern (confirmed = blue)
 * Based on component path or feature flag
 * @param componentName - Name of the component
 * @returns boolean indicating whether to use new color pattern
 */
export const shouldUseNewColorPattern = (componentName?: string): boolean => {
  // Components that have been updated to use confirmed = blue
  const updatedComponents = [
    'BookingService',
    'HotelBookings',
    'BookingConfirmationPage',
    'BookingManagementPage',
    'GuestBookingManagementPage',
    'FrontDeskBookingManagement',
    'FrontDeskBookingDetails',
    'BookingViewEdit',
    'BookingSearchPage',
    'HotelAdminDashboard',
    'BookingSearchModal',
    'UnifiedBookingDetails',
    'CheckInDialog',
    'BookingConfirmationScreen',
    'BookingDetailsScreen',
    'OfflineWalkInBooking', // Added as we update it
  ];

  return componentName ? updatedComponents.includes(componentName) : false;
};

/**
 * Get smart status color that automatically chooses between new and legacy patterns
 * @param status - Status string
 * @param componentName - Optional component name for pattern detection
 * @returns Material-UI color name
 */
export const getSmartStatusColor = (status: string, componentName?: string): StatusColorType | 'default' => {
  return shouldUseNewColorPattern(componentName) 
    ? getBookingStatusColor(status)
    : getLegacyStatusColor(status);
};