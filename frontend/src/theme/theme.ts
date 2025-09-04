import { createTheme } from '@mui/material/styles';

// Custom theme constants
export const themeConstants = {
  // Brand colors
  brandGold: '#FFD700',
  hotelShopRed: '#cc0000',
  
  // Payment method colors
  mbirrOrange: '#FF6B35',
  telebirrGreen: '#00A651',
  
  // Layout constants
  logoHeight: 32, // 32px - compact navbar logo
  headerMaxWidths: {
    xs: '280px',
    sm: '400px', 
    md: '600px'
  },
  
  // Common dimensions
  commonHeights: {
    loading: '200px',
    scrollableArea: '300px',
    uploadArea: '400px'
  },
  
  // Shadows and effects
  shadows: {
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
    cardShadow: '0 8px 32px rgba(0,0,0,0.3)',
    buttonShadow: '0 4px 20px rgba(0,0,0,0.5)'
  },
  
  // Border styles
  borders: {
    light: '1px solid',
    medium: '2px solid',
    dashed: '2px dashed'
  },
  
  // Scrollbar styles
  scrollbar: {
    width: 6,
    track: '#f1f1f1',
    thumb: '#c1c1c1',
    thumbRadius: 3,
    thumbHover: '#a8a8a8',
  },
  
  // Transparency values
  alpha: {
    low: 0.1,
    medium: 0.2,
    high: 0.3,
  },
  
  // Gradient styles
  gradients: {
    primaryButton: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
    successButton: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
  },
  
  // Performance-optimized animation styles
  animations: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease', 
    slow: 'all 0.3s ease',
    none: 'none',
  },
  
  // Lightweight shadow alternatives
  lightShadows: {
    minimal: '0 1px 3px rgba(0,0,0,0.1)',
    light: '0 2px 4px rgba(0,0,0,0.1)', 
    medium: '0 4px 8px rgba(0,0,0,0.1)',
  },
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#f50057',
      light: '#ff5983',
      dark: '#c51162',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    // Add custom colors
    success: {
      main: themeConstants.telebirrGreen,
      light: '#F0FFF4',
    },
    warning: {
      main: themeConstants.mbirrOrange,
      light: '#FFF5F0',
    },
    info: {
      main: '#2196f3',
      light: '#e3f2fd',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8, // Base spacing unit
});

// Extend theme with custom properties
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      constants: typeof themeConstants;
    };
  }
  interface ThemeOptions {
    custom?: {
      constants?: typeof themeConstants;
    };
  }
}

const extendedTheme = createTheme(theme, {
  custom: {
    constants: themeConstants,
  },
});

export default extendedTheme;
