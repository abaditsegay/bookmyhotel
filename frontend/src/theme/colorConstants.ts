export const STATUS_COLORS = {
  // Booking Status Colors (following booked = blue pattern)
  BOOKED: 'primary',        // Blue
  PENDING: 'warning',       // Orange/Yellow
  CANCELLED: 'error',       // Red
  CHECKED_IN: 'success',    // Green
  CHECKED_OUT: 'info',      // Light Blue
  
  // Payment Status Colors
  PAID: 'success',          // Green
  PROCESSING: 'warning',    // Orange
  FAILED: 'error',          // Red
  REFUNDED: 'info',         // Light Blue
  
  // Admin Role Colors
  HOTEL_ADMIN:  'orange',    // Orange theme for hotel admins
  SUPER_ADMIN:  'primary',   // Blue theme for super admins
  FRONT_DESK:   'secondary', // Purple theme for front desk
} as const;

export const ADMIN_THEME_COLORS = {
  HOTEL_ADMIN: {
    primary: '#ff9800',
    primaryHover: '#f57c00',
    primaryDark: '#e65100',
    accent: '#ffcc80',
  },
  SUPER_ADMIN: {
    primary: '#1565c0',
    primaryHover: '#0d47a1',
    primaryDark: '#0d47a1',
    accent: '#bbdefb',
  },
  FRONT_DESK: {
    primary: '#9c27b0',
    primaryHover: '#7b1fa2',
    primaryDark: '#4a148c',
    accent: '#ce93d8',
  }
} as const;

export type StatusColorType = typeof STATUS_COLORS[keyof typeof STATUS_COLORS];
export type AdminThemeType = keyof typeof ADMIN_THEME_COLORS;