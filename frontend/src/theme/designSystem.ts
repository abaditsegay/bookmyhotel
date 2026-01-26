// Design System Configuration
// Provides consistent spacing, colors, typography, and other design tokens

export const designSystem = {
  // Consistent spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64
  },

  // Font weight scale
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },

  // Typography hierarchy
  typography: {
    h1: { 
      fontSize: '2.5rem', 
      fontWeight: 700, 
      lineHeight: 1.2,
      letterSpacing: '-0.01562em'
    },
    h2: { 
      fontSize: '2rem', 
      fontWeight: 600, 
      lineHeight: 1.25,
      letterSpacing: '-0.00833em'
    },
    h3: { 
      fontSize: '1.75rem', 
      fontWeight: 600, 
      lineHeight: 1.3 
    },
    h4: { 
      fontSize: '1.5rem', 
      fontWeight: 600, 
      lineHeight: 1.35 
    },
    h5: { 
      fontSize: '1.25rem', 
      fontWeight: 600, 
      lineHeight: 1.4 
    },
    h6: { 
      fontSize: '1.125rem', 
      fontWeight: 600, 
      lineHeight: 1.4 
    },
    body1: { 
      fontSize: '1rem', 
      fontWeight: 400, 
      lineHeight: 1.5 
    },
    body2: { 
      fontSize: '0.875rem', 
      fontWeight: 400, 
      lineHeight: 1.43 
    },
    caption: { 
      fontSize: '0.75rem', 
      fontWeight: 400, 
      lineHeight: 1.33,
      letterSpacing: '0.03333em'
    },
    button: { 
      fontSize: '0.875rem', 
      fontWeight: 500, 
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none' as const
    }
  },

  // Color system with semantic meanings - Premium Business Theme
  colors: {
    primary: {
      50: '#e6ecf5',
      100: '#c0d0e6',
      200: '#96b1d5',
      300: '#6c92c4',
      400: '#4d7ab8',
      500: '#2d63ab',
      600: '#285ba4',
      700: '#22519a',
      800: '#1c4791',
      900: '#1a365d',
      main: '#1a365d',
      light: '#2d63ab',
      dark: '#0f2744',
      contrastText: '#ffffff',
      25: '#f0f4f8'
    },
    secondary: {
      main: '#E8B86D',
      light: '#F0C880',
      dark: '#D4A355',
      contrastText: '#1a365d'
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#f57c00',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff'
    },
    error: {
      main: '#d32f2f',
      light: '#f44336',
      dark: '#c62828',
      contrastText: '#ffffff'
    },
    info: {
      main: '#63B3ED',
      light: '#90CDF4',
      dark: '#3182CE',
      contrastText: '#ffffff'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)'
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
      light: '#F5F5F5'
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    // Enhanced surface hierarchy
    surfaces: {
      elevated: '#FFFFFF',
      base: '#FAFAFA',
      sunken: '#F5F5F5',
      overlay: 'rgba(0, 0, 0, 0.6)'
    },
    // Interactive states
    interactive: {
      primary: '#1a365d',
      primaryHover: '#2a4a6d',
      primaryActive: '#0f2744',
      secondary: '#E8B86D',
      secondaryHover: '#F0C880'
    },
    // Hotel industry status colors
    status: {
      available: '#4CAF50',
      booked: '#2196F3',
      occupied: '#FF9800',
      maintenance: '#F44336',
      cleaning: '#FFD54F',
      pending: '#9E9E9E',
      checkedOut: '#607D8B'
    }
  },

  // Glass morphism effects
  effects: {
    glass: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
    },
    glassDark: {
      background: 'rgba(30, 30, 30, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #1a365d 0%, #0f2744 100%)',
      secondary: 'linear-gradient(135deg, #E8B86D 0%, #D4A355 100%)',
      accent: 'linear-gradient(135deg, #63B3ED 0%, #3182CE 100%)',
      warm: 'linear-gradient(135deg, #F0C880 0%, #E8B86D 100%)'
    }
  },

  // Elevation/Shadow system
  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.16), 0 1px 3px rgba(0, 0, 0, 0.23)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.19), 0 6px 10px rgba(0, 0, 0, 0.23)',
    xl: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
    card: '0 2px 8px rgba(25, 118, 210, 0.1)',
    cardHover: '0 4px 16px rgba(25, 118, 210, 0.15)',
    dialog: '0 8px 32px rgba(25, 118, 210, 0.15)'
  },

  // Border radius scale
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999
  },

  // Breakpoints for responsive design
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920
  },

  // Z-index scale
  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500
  }
};

// Status color mappings for consistent status displays
export const statusColors = {
  booking: {
    confirmed: 'primary',
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