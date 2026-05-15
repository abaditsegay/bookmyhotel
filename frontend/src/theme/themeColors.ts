/**
 * Legacy color compatibility layer.
 *
 * New code should prefer the MUI theme and designSystem tokens directly.
 * Existing components can keep importing these helpers while they are migrated.
 */

import { designSystem } from './designSystem';

const themeConstants = {
  brandPrimary: designSystem.colors.primary.main,
  brandPrimaryLight: designSystem.colors.primary.light,
  brandPrimaryDark: designSystem.colors.primary.dark,
  brandSecondary: designSystem.colors.secondary.main,
  brandAccent: designSystem.colors.warning.light,
  greenPalette: {
    50: '#e8eaf6',
    100: '#c5cae9',
    200: '#9fa8da',
    300: '#7986cb',
    400: '#5c6bc0',
    500: '#3f51b5',
    600: '#3949ab',
    700: '#303f9f',
    800: designSystem.colors.primary.dark,
    900: designSystem.colors.primary.main,
  },
  uiColors: {
    inputFocus: designSystem.colors.primary.main,
    inputHover: designSystem.colors.primary.dark,
    inputBorder: designSystem.colors.divider,
    primaryButton: designSystem.colors.primary.main,
    primaryButtonHover: designSystem.colors.primary.dark,
    primaryButtonPressed: designSystem.colors.primary.dark,
    success: designSystem.colors.success.main,
    confirmed: designSystem.colors.primary.main,
    pending: designSystem.colors.warning.main,
    error: designSystem.colors.error.main,
    stepperActive: designSystem.colors.primary.main,
    stepperCompleted: designSystem.colors.primary.dark,
    stepperInactive: designSystem.colors.text.disabled,
    cardBorder: designSystem.colors.divider,
    cardHover: designSystem.colors.background.light,
    surfaceElevated: designSystem.colors.background.paper,
  },
} as const;

const lightGradients = {
  primaryButton: `linear-gradient(135deg, ${designSystem.colors.primary.main} 0%, ${designSystem.colors.primary.dark} 100%)`,
  secondaryButton: `linear-gradient(135deg, ${designSystem.colors.secondary.main} 0%, ${designSystem.colors.secondary.dark} 100%)`,
  successButton: `linear-gradient(135deg, ${designSystem.colors.success.main} 0%, ${designSystem.colors.success.dark} 100%)`,
  heroBackground: designSystem.effects.gradient.primary,
} as const;

const darkGradients = {
  primaryButton: `linear-gradient(135deg, ${designSystem.colors.primary.light} 0%, ${designSystem.colors.primary.main} 100%)`,
  secondaryButton: `linear-gradient(135deg, ${designSystem.colors.secondary.light} 0%, ${designSystem.colors.secondary.main} 100%)`,
  successButton: `linear-gradient(135deg, ${designSystem.colors.success.light} 0%, ${designSystem.colors.success.main} 100%)`,
  heroBackground: `linear-gradient(135deg, ${designSystem.colors.background.dark} 0%, #1e293b 100%)`,
} as const;

const getThemeColors = (mode: 'light' | 'dark' = 'light') => ({
  gradients: mode === 'dark' ? darkGradients : lightGradients,
});

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
  // Interactive elements (buttons, links, form focus) - Premium Business Theme
  PRIMARY: designSystem.colors.primary.main,
  PRIMARY_HOVER: designSystem.colors.primary.dark,
  PRIMARY_PRESSED: designSystem.colors.primary.dark,
  
  SECONDARY: designSystem.colors.secondary.main,
  SECONDARY_HOVER: designSystem.colors.secondary.light,
  
  // Status colors - Professional hotel management colors
  BOOKED: designSystem.colors.info.main,
  PENDING: designSystem.colors.warning.main,
  SUCCESS: designSystem.colors.success.main,
  ERROR: designSystem.colors.error.main,
  CANCELLED: '#757575',
  CHECKED_IN: designSystem.colors.success.main,
  CHECKED_OUT: '#607D8B',
  AVAILABLE: '#4CAF50',
  OCCUPIED: '#FF9800',
  MAINTENANCE: '#F44336',
  CLEANING: '#FFD54F',
  
  // Form elements - Premium theme
  INPUT_FOCUS: designSystem.colors.primary.main,
  INPUT_HOVER: designSystem.colors.primary.dark,
  INPUT_BORDER: designSystem.colors.divider,
  INPUT_ERROR: designSystem.colors.error.main,
  
  // Surface colors - Premium neutral theme
  CARD_BORDER: 'transparent',
  CARD_HOVER: designSystem.colors.background.light,
  
  // Additional UI colors
  WARNING: designSystem.colors.warning.main,
  INFO: designSystem.colors.info.main,
  WHITE: designSystem.colors.background.paper,
  GOLD: '#ffd700',
  
  // Text colors
  TEXT_PRIMARY: designSystem.colors.text.primary,
  TEXT_SECONDARY: designSystem.colors.text.secondary,
  TEXT_DISABLED: designSystem.colors.text.disabled,
  
  // Background colors
  BG_DEFAULT: designSystem.colors.background.default,
  BG_PAPER: designSystem.colors.background.paper,
  BG_LIGHT: designSystem.colors.background.light,
  BG_SLATE: '#475569',
  
  // Payment provider brand colors (keep as-is for brand recognition)
  MBIRR_ORANGE: '#FFA500',      // M-Birr brand orange
  TELEBIRR_GREEN: '#4CAF50',    // TeleBirr brand green
  
  // Status background colors (for chips and badges)
  BG_SUCCESS_LIGHT: designSystem.colors.success.light,
  BG_WARNING_LIGHT: designSystem.colors.warning.light,
  BG_ERROR_LIGHT: designSystem.colors.error.light,
  BG_INFO_LIGHT: designSystem.colors.info.light,
  BG_DEFAULT_LIGHT: designSystem.colors.background.light,
  
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
  BORDER_LIGHT: designSystem.colors.divider,
  BORDER_DEFAULT: designSystem.colors.divider,
  DIVIDER: designSystem.colors.divider,
  
  // Black variations
  BLACK: '#000000',             // Pure black
  BLACK_ALPHA_87: 'rgba(0, 0, 0, 0.87)', // High emphasis text
  BLACK_ALPHA_60: 'rgba(0, 0, 0, 0.60)', // Medium emphasis text
  
  // Gradient presets - Premium
  GRADIENT_PRIMARY: lightGradients.primaryButton,
  GRADIENT_SECONDARY: lightGradients.secondaryButton,
  GRADIENT_ACCENT: `linear-gradient(135deg, ${designSystem.colors.info.light} 0%, ${designSystem.colors.info.main} 100%)`,
  GRADIENT_WARM: `linear-gradient(135deg, ${designSystem.colors.secondary.light} 0%, ${designSystem.colors.secondary.main} 100%)`,
  GRADIENT_PURPLE: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  GRADIENT_SLATE: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
  GRADIENT_WHITE: `linear-gradient(135deg, ${designSystem.colors.background.paper} 0%, ${designSystem.colors.background.paper} 100%)`,
  GRADIENT_DARK: darkGradients.heroBackground,
  // Glass effects
  GLASS_LIGHT: 'rgba(255, 255, 255, 0.7)',
  GLASS_DARK: 'rgba(30, 30, 30, 0.7)',
} as const;

// Color palette access
export const GREEN_PALETTE = themeConstants.greenPalette;

// Helper functions for common use cases
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toUpperCase().replace(/[\s_-]/g, '');
  
  switch (normalizedStatus) {
    case 'BOOKED':
    case 'ACTIVE':
      return COLORS.BOOKED;
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
    case 'BOOKED':
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
    case 'BOOKED':
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
 * sx={{ color: getStatusColor('booked') }}
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