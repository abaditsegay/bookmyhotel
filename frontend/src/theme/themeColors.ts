/**
 * Centralized Color Utilities
 * 
 * This file provides easy access to all theme colors from a single location.
 * Components should import colors from here instead of using hardcoded values.
 * 
 * To change the entire app's color scheme:
 * 1. Update the brand colors in themes.ts themeConstants.brand
 * 2. All components using these utilities will automatically update
 */

import { themeConstants, getThemeColors } from './themes';

// Export centralized color constants for direct use
export const colors = themeConstants.uiColors;
export const brand = {
  primary: themeConstants.brandPrimary,
  primaryLight: themeConstants.brandPrimaryLight,
  primaryDark: themeConstants.brandPrimaryDark,
  secondary: themeConstants.brandSecondary,
  accent: themeConstants.brandAccent,
};

// Export theme-aware color getter
export { getThemeColors };

// Convenience exports for common colors (these will update automatically when brand colors change)
export const COLORS = {
  // Interactive elements (buttons, links, form focus) - Navy Blue Theme
  PRIMARY: '#1565c0',           // Navy blue (Blue 800)
  PRIMARY_HOVER: '#0d47a1',     // Darker blue for hover (Blue 900)
  PRIMARY_PRESSED: '#0d47a1',   // Dark blue for pressed (Blue 900)
  
  SECONDARY: '#42a5f5',         // Light blue for secondary (Blue 400)
  SECONDARY_HOVER: '#1565c0',   // Medium blue for secondary hover
  
  // Status colors - Professional hotel management colors
  CONFIRMED: '#1565c0',         // Blue for confirmed bookings
  PENDING: '#fb8c00',           // Professional orange for pending (Material Orange 600)
  SUCCESS: '#1976d2',           // Blue for success states (Material Blue 700)
  ERROR: '#d32f2f',             // Professional red for errors (Material Red 700)
  CANCELLED: '#757575',         // Gray for cancelled (Material Grey 600)
  CHECKED_IN: '#1976d2',        // Blue for checked in (success)
  CHECKED_OUT: '#1565c0',       // Blue for checked out (completed)
  
  // Form elements - Blue theme
  INPUT_FOCUS: '#1565c0',       // Blue focus color
  INPUT_HOVER: '#42a5f5',       // Light blue hover
  INPUT_BORDER: '#e0e0e0',      // Neutral gray border (Material Grey 300)
  INPUT_ERROR: '#d32f2f',       // Red for errors
  
  // Surface colors - Professional neutral theme
  CARD_BORDER: '#e0e0e0',       // Neutral gray card borders
  CARD_HOVER: '#fafafa',        // Very light gray hover (Material Grey 50)
  
  // Additional UI colors
  WARNING: '#ff9800',           // Orange for warnings (Material Orange 500)
  INFO: '#1565c0',              // Blue for info
  WHITE: '#ffffff',             // Pure white
  GOLD: '#ffd700',              // Gold for stars/ratings
  
  // Text colors
  TEXT_PRIMARY: '#212121',      // Primary text (Material Grey 900)
  TEXT_SECONDARY: '#616161',    // Secondary text (Material Grey 700)
  TEXT_DISABLED: '#9e9e9e',     // Disabled text (Material Grey 400)
  
  // Background colors
  BG_DEFAULT: '#f5f5f5',        // Default background (Material Grey 100)
  BG_PAPER: '#ffffff',          // Paper/card background
  BG_LIGHT: '#fafafa',          // Light background (Material Grey 50)
  BG_SLATE: '#475569',          // Slate background for contrast
  
  // Payment provider brand colors (keep as-is for brand recognition)
  MBIRR_ORANGE: '#FFA500',      // M-Birr brand orange
  TELEBIRR_GREEN: '#4CAF50',    // TeleBirr brand green
  
  // Status background colors (for chips and badges)
  BG_SUCCESS_LIGHT: '#e3f2fd',  // Light blue background
  BG_WARNING_LIGHT: '#fff8e1',  // Light orange background
  BG_ERROR_LIGHT: '#ffebee',    // Light red background
  BG_INFO_LIGHT: '#e3f2fd',     // Light blue background
  BG_DEFAULT_LIGHT: '#f5f5f5',  // Light grey background
  
  // Slate/Dark backgrounds (Professional UI)
  SLATE_50: '#f8fafc',
  SLATE_400: '#94a3b8',
  SLATE_500: '#64748b',
  SLATE_600: '#475569',
  SLATE_700: '#334155',
  SLATE_800: '#1e293b',
  SLATE_900: '#0f172a',
  
  // Purple accent (for special highlights)
  PURPLE_400: '#c084fc',
  PURPLE_500: '#a855f7',
  PURPLE_600: '#9333ea',
  PURPLE_700: '#7e22ce',
  
  // Common borders and dividers
  BORDER_LIGHT: '#e0e0e0',      // Light gray border (Material Grey 300)
  BORDER_DEFAULT: '#ddd',       // Default border
  DIVIDER: '#e5e7eb',           // Divider color
  
  // Black variations
  BLACK: '#000000',             // Pure black
  BLACK_ALPHA_87: 'rgba(0, 0, 0, 0.87)', // High emphasis text
  BLACK_ALPHA_60: 'rgba(0, 0, 0, 0.60)', // Medium emphasis text
  
  // Gradient presets
  GRADIENT_PURPLE: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  GRADIENT_SLATE: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
  GRADIENT_WHITE: 'linear-gradient(135deg, #ffffff 0%, #ffffff 100%)',
  GRADIENT_DARK: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
} as const;

// Color palette access
export const GREEN_PALETTE = themeConstants.greenPalette;

// Helper functions for common use cases
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toUpperCase().replace(/[\s_-]/g, '');
  
  switch (normalizedStatus) {
    case 'CONFIRMED':
    case 'ACTIVE':
      return COLORS.CONFIRMED;
    case 'PENDING':
    case 'UNDERREVIEW':
      return COLORS.PENDING;
    case 'SUCCESS':
    case 'COMPLETED':
    case 'PAID':
    case 'APPROVED':
      return COLORS.SUCCESS;
    case 'ERROR':
    case 'FAILED':
    case 'SUSPENDED':
      return COLORS.ERROR;
    case 'CANCELLED':
    case 'INACTIVE':
    case 'REJECTED':
      return COLORS.CANCELLED;
    case 'CHECKEDIN':
      return COLORS.CHECKED_IN;
    case 'CHECKEDOUT':
      return COLORS.CHECKED_OUT;
    default:
      return COLORS.PRIMARY;
  }
};

// Get background color for status chips
export const getStatusBgColor = (status: string): string => {
  const normalizedStatus = status.toUpperCase().replace(/[\s_-]/g, '');
  
  switch (normalizedStatus) {
    case 'SUCCESS':
    case 'COMPLETED':
    case 'PAID':
    case 'APPROVED':
    case 'ACTIVE':
    case 'CHECKEDIN':
      return COLORS.BG_SUCCESS_LIGHT;
    case 'PENDING':
    case 'UNDERREVIEW':
      return COLORS.BG_WARNING_LIGHT;
    case 'ERROR':
    case 'FAILED':
    case 'SUSPENDED':
      return COLORS.BG_ERROR_LIGHT;
    case 'CONFIRMED':
    case 'CHECKEDOUT':
      return COLORS.BG_INFO_LIGHT;
    case 'CANCELLED':
    case 'INACTIVE':
    case 'REJECTED':
    default:
      return COLORS.BG_DEFAULT_LIGHT;
  }
};

export const getInteractiveColor = (state: 'default' | 'hover' | 'pressed' = 'default', type: 'primary' | 'secondary' = 'primary'): string => {
  if (type === 'secondary') {
    switch (state) {
      case 'hover':
        return COLORS.SECONDARY_HOVER;
      case 'pressed':
        return COLORS.SECONDARY_HOVER; // Using hover as pressed for secondary
      default:
        return COLORS.SECONDARY;
    }
  }
  
  switch (state) {
    case 'hover':
      return COLORS.PRIMARY_HOVER;
    case 'pressed':
      return COLORS.PRIMARY_PRESSED;
    default:
      return COLORS.PRIMARY;
  }
};

export const getFormColor = (state: 'default' | 'hover' | 'focus' | 'error' = 'default'): string => {
  switch (state) {
    case 'hover':
      return COLORS.INPUT_HOVER;
    case 'focus':
      return COLORS.INPUT_FOCUS;
    case 'error':
      return COLORS.INPUT_ERROR;
    default:
      return COLORS.INPUT_BORDER;
  }
};

// Gradient helpers
export const getGradient = (
  type: 'primary' | 'secondary' | 'success' | 'slate' | 'purple' | 'white' | 'dark' = 'primary',
  mode: 'light' | 'dark' = 'light'
): string => {
  // Handle new gradient types
  if (type === 'slate') return COLORS.GRADIENT_SLATE;
  if (type === 'purple') return COLORS.GRADIENT_PURPLE;
  if (type === 'white') return COLORS.GRADIENT_WHITE;
  if (type === 'dark') return COLORS.GRADIENT_DARK;
  
  // Handle original gradient types
  const gradients = getThemeColors(mode).gradients;
  
  switch (type) {
    case 'secondary':
      return gradients.secondaryButton;
    case 'success':
      return gradients.successButton;
    default:
      return gradients.primaryButton;
  }
};

// Alpha (transparency) helpers
export const addAlpha = (color: string, alpha: number): string => {
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Theme-aware material-ui color helper
export const getMuiColor = (colorName: keyof typeof COLORS): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
  // Map color names to Material-UI palette colors
  switch (colorName) {
    case 'PRIMARY':
    case 'CONFIRMED':
    case 'CHECKED_OUT':
    case 'INPUT_FOCUS':
      return 'primary';
    case 'SECONDARY':
    case 'INPUT_HOVER':
      return 'secondary';
    case 'SUCCESS':
    case 'CHECKED_IN':
      return 'success';
    case 'ERROR':
    case 'INPUT_ERROR':
      return 'error';
    case 'PENDING':
      return 'warning';
    default:
      return 'primary';
  }
};

/**
 * Usage Examples:
 * 
 * // Instead of hardcoding colors:
 * sx={{ color: '#4caf50' }}
 * 
 * // Use centralized colors:
 * sx={{ color: COLORS.PRIMARY }}
 * 
 * // For status-based colors:
 * sx={{ color: getStatusColor('confirmed') }}
 * 
 * // For interactive states:
 * sx={{ 
 *   color: getInteractiveColor('default'),
 *   '&:hover': { color: getInteractiveColor('hover') }
 * }}
 * 
 * // For gradients:
 * sx={{ background: getGradient('primary') }}
 */