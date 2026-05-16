// Design System Configuration
// Centralized typography, spacing, color semantics, and surface tokens.

export type DesignSystemMode = 'light' | 'dark';

const semanticColorSchemes = {
  light: {
    background: {
      primary: '#F6F7F9',
      secondary: '#FFFFFF',
      card: '#FFFFFF',
      sidebar: '#111827',
      input: '#FFFFFF',
      hoverSurface: '#F8FAFC',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      muted: '#6B7280',
      inverse: '#F9FAFB',
    },
    border: {
      default: '#E5E7EB',
      strong: '#D1D5DB',
      divider: '#ECEFF3',
      input: '#D1D5DB',
    },
    table: {
      header: '#F3F4F6',
      rowHover: '#F8FAFC',
    },
    action: {
      primary: '#1E3A5F',
      primaryHover: '#274B78',
      secondary: '#FFFFFF',
      secondaryHover: '#F8FAFC',
      accent: '#C89B3C',
      accentHover: '#B2872E',
    },
    focus: {
      ring: '#1E3A5F',
    },
  },
  dark: {
    background: {
      primary: '#111827',
      secondary: '#1A2233',
      card: '#1F2937',
      sidebar: '#0B1220',
      input: '#111827',
      hoverSurface: '#243041',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      muted: '#9CA3AF',
      inverse: '#111827',
    },
    border: {
      default: '#374151',
      strong: '#4B5563',
      divider: '#2B3545',
      input: '#4B5563',
    },
    table: {
      header: '#243041',
      rowHover: '#243041',
    },
    action: {
      primary: '#5B8DEF',
      primaryHover: '#7AA2F7',
      secondary: '#1A2233',
      secondaryHover: '#243041',
      accent: '#D4A94D',
      accentHover: '#E0B761',
    },
    focus: {
      ring: '#7AA2F7',
    },
  },
} as const;

export const designSystem = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  typography: {
    h1: {
      fontSize: '2.875rem',
      fontWeight: 700,
      lineHeight: 1.12,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.18,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 700,
      lineHeight: 1.24,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.32,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.42,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.9375rem',
      fontWeight: 400,
      lineHeight: 1.55,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.03em',
    },
    button: {
      fontSize: '0.9375rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '0.01em',
      textTransform: 'none' as const,
    },
  },

  colorSchemes: semanticColorSchemes,

  colors: {
    primary: {
      25: '#F3F6FA',
      50: '#E7EEF5',
      100: '#D0DEEC',
      200: '#AFC6DB',
      300: '#88AAC6',
      400: '#5C84A7',
      500: '#3B6385',
      600: '#274B78',
      700: '#223F67',
      800: '#1E3A5F',
      900: '#162C46',
      main: '#1E3A5F',
      light: '#274B78',
      dark: '#162C46',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C89B3C',
      light: '#D6B369',
      dark: '#A77E2E',
      contrastText: '#111827',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1F5B24',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
      dark: '#8E1F1F',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#3F6B8C',
      light: '#5B8AA9',
      dark: '#2C516B',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: semanticColorSchemes.light.text.primary,
      secondary: semanticColorSchemes.light.text.secondary,
      disabled: semanticColorSchemes.light.text.muted,
      hint: semanticColorSchemes.light.text.muted,
    },
    background: {
      default: semanticColorSchemes.light.background.primary,
      paper: semanticColorSchemes.light.background.secondary,
      light: semanticColorSchemes.light.background.hoverSurface,
    },
    divider: semanticColorSchemes.light.border.divider,
    surfaces: {
      elevated: semanticColorSchemes.light.background.card,
      base: semanticColorSchemes.light.background.primary,
      sunken: semanticColorSchemes.light.background.hoverSurface,
      overlay: 'rgba(17, 24, 39, 0.58)',
    },
    interactive: {
      primary: semanticColorSchemes.light.action.primary,
      primaryHover: semanticColorSchemes.light.action.primaryHover,
      primaryActive: '#162C46',
      secondary: semanticColorSchemes.light.action.accent,
      secondaryHover: semanticColorSchemes.light.action.accentHover,
    },
    semantic: semanticColorSchemes.light,
    status: {
      available: '#2E7D32',
      booked: '#1E3A5F',
      occupied: '#D97706',
      maintenance: '#C62828',
      cleaning: '#C89B3C',
      pending: '#6B7280',
      checkedOut: '#4B5563',
    },
  },

  effects: {
    glass: {
      background: semanticColorSchemes.light.background.card,
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
      border: `1px solid ${semanticColorSchemes.light.border.default}`,
      boxShadow: 'none',
    },
    glassDark: {
      background: semanticColorSchemes.dark.background.card,
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
      border: `1px solid ${semanticColorSchemes.dark.border.default}`,
      boxShadow: 'none',
    },
    gradient: {
      primary: 'linear-gradient(180deg, #1E3A5F 0%, #1E3A5F 100%)',
      secondary: 'linear-gradient(180deg, #C89B3C 0%, #C89B3C 100%)',
      accent: 'linear-gradient(180deg, #3F6B8C 0%, #3F6B8C 100%)',
      warm: 'linear-gradient(180deg, #D6B369 0%, #D6B369 100%)',
    },
  },

  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(15, 23, 42, 0.05)',
    sm: '0 2px 6px rgba(15, 23, 42, 0.06)',
    md: '0 8px 20px rgba(15, 23, 42, 0.08)',
    lg: '0 16px 34px rgba(15, 23, 42, 0.12)',
    xl: '0 24px 56px rgba(15, 23, 42, 0.16)',
    card: '0 8px 24px rgba(15, 23, 42, 0.08)',
    cardHover: '0 16px 32px rgba(15, 23, 42, 0.12)',
    dialog: '0 24px 56px rgba(15, 23, 42, 0.18)',
  },

  borderRadius: {
    none: 0,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 14,
    full: 9999,
  },

  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },

  layout: {
    pagePaddingY: {
      xs: 3,
      md: 4,
    },
    pagePaddingX: {
      xs: 2,
      md: 3,
    },
    pagePaddingBottom: {
      xs: 8,
      md: 10,
    },
    sectionGap: {
      xs: 2,
      md: 3,
    },
    cardPadding: {
      xs: 3,
      md: 4,
    },
  },

  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
};

export const getColorScheme = (mode: DesignSystemMode = 'light') => designSystem.colorSchemes[mode];

// Status color mappings for consistent status displays
export const statusColors = {
  booking: {
    booked: 'primary',
    'checked in': 'success', 
    'checked_in': 'success',
    'checked out': 'info',
    'checked_out': 'info',
    cancelled: 'error',
    pending: 'warning'
  },
  payment: {
    paid: 'success',
    pending: 'warning',
    pay_at_frontdesk: 'info',
    failed: 'error',
    refunded: 'info'
  },
  room: {
    available: 'success',
    occupied: 'error',
    maintenance: 'warning',
    cleaning: 'info'
  },
  stock: {
    'in stock': 'success',
    'low stock': 'warning',
    'out of stock': 'error'
  }
} as const;

// Animation curves for consistent motion
export const animations = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
  }
};