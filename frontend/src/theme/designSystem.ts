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

  // Color system with semantic meanings
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
      main: '#1565c0',
      light: '#42a5f5',
      dark: '#0d47a1',
      contrastText: '#ffffff',
      25: '#f0f7ff'
    },
    secondary: {
      main: '#757575',
      light: '#9e9e9e',
      dark: '#424242',
      contrastText: '#ffffff'
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff'
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#ffffff'
    },
    info: {
      main: '#1565c0',
      light: '#42a5f5',
      dark: '#0d47a1',
      contrastText: '#ffffff'
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)'
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      light: '#f5f5f5'
    },
    divider: 'rgba(0, 0, 0, 0.12)'
  },

  // Elevation/Shadow system
  shadows: {
    none: 'none',
    xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
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