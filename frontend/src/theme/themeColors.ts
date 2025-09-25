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
  // Interactive elements (buttons, links, form focus) - Professional Blue Theme
  PRIMARY: '#1565c0',           // Professional deep blue
  PRIMARY_HOVER: '#0d47a1',     // Darker blue for hover
  PRIMARY_PRESSED: '#0d47a1',   // Dark blue for pressed
  
  SECONDARY: '#1976d2',         // Medium blue for secondary
  SECONDARY_HOVER: '#1565c0',   // Darker blue for secondary hover
  
  // Status colors - Professional hotel management colors
  CONFIRMED: '#1565c0',         // Blue for confirmed bookings
  PENDING: '#f57c00',           // Professional orange for pending
  SUCCESS: '#2e7d32',           // Keep green for success states
  ERROR: '#d32f2f',             // Professional red for errors
  CANCELLED: '#757575',         // Gray for cancelled
  CHECKED_IN: '#2e7d32',        // Green for checked in (success)
  CHECKED_OUT: '#1565c0',       // Blue for checked out (completed)
  
  // Form elements - Blue theme
  INPUT_FOCUS: '#1565c0',       // Blue focus color
  INPUT_HOVER: '#1976d2',       // Medium blue hover
  INPUT_BORDER: '#e3f2fd',      // Light blue border
  INPUT_ERROR: '#d32f2f',       // Red for errors
  
  // Surface colors - Professional blue theme
  CARD_BORDER: '#e3f2fd',       // Light blue card borders
  CARD_HOVER: '#f5f9ff',        // Very light blue hover
} as const;

// Color palette access
export const GREEN_PALETTE = themeConstants.greenPalette;

// Helper functions for common use cases
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toUpperCase();
  
  switch (normalizedStatus) {
    case 'CONFIRMED':
      return COLORS.CONFIRMED;
    case 'PENDING':
      return COLORS.PENDING;
    case 'SUCCESS':
    case 'COMPLETED':
      return COLORS.SUCCESS;
    case 'ERROR':
    case 'FAILED':
      return COLORS.ERROR;
    case 'CANCELLED':
      return COLORS.CANCELLED;
    case 'CHECKED_IN':
    case 'CHECKEDIN':
      return COLORS.CHECKED_IN;
    case 'CHECKED_OUT':
    case 'CHECKEDOUT':
      return COLORS.CHECKED_OUT;
    default:
      return COLORS.PRIMARY;
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
export const getGradient = (type: 'primary' | 'secondary' | 'success' = 'primary', mode: 'light' | 'dark' = 'light'): string => {
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