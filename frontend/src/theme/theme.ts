import { createTheme } from '@mui/material/styles';

// Custom theme constants
export const themeConstants = {
  // Brand colors
  brandGold: '#FFD700',
  hotelShopRed: '#cc0000',
  
  // Payment method colors
  mbirrOrange: '#FF6B35',
  telebirrGreen: '#00A651',
  
  // Dark theme payment method colors (for better contrast)
  darkTheme: {
    mbirrOrange: '#FF8A5C', // Lighter orange for dark backgrounds
    telebirrGreen: '#2ECC71', // Lighter green for dark backgrounds
    cardBackground: 'rgba(255, 255, 255, 0.05)', // Subtle card background
    selectedCardBackground: 'rgba(255, 255, 255, 0.1)', // Selected card background
    borderColor: 'rgba(255, 255, 255, 0.12)', // Border color for dark theme
  },
  
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
  
  // Standard spacing values (theme.spacing() multipliers)
  spacing: {
    xs: 0.5, // 4px
    sm: 1,   // 8px  
    md: 2,   // 16px
    lg: 3,   // 24px
    xl: 4,   // 32px
    xxl: 6,  // 48px
  },
  
  // Standard button sizes with mobile-optimized touch targets
  buttonSizes: {
    small: { height: 36, padding: '8px 16px' }, // Increased from 32px for better touch
    medium: { height: 44, padding: '10px 24px' }, // Increased from 40px for better touch
    large: { height: 52, padding: '12px 32px' }, // Increased from 48px for better touch
  },

  // Mobile-optimized touch targets (minimum 44px recommended)
  touchTargets: {
    minimum: 44, // Apple HIG and Material Design minimum
    comfortable: 48, // Comfortable touch target
    large: 56, // Large touch target for primary actions
  },

  // Mobile-specific spacing (responsive spacing multipliers)
  mobileSpacing: {
    xs: { mobile: 0.5, desktop: 0.5 }, // 4px
    sm: { mobile: 1, desktop: 1 },     // 8px
    md: { mobile: 1.5, desktop: 2 },   // 12px mobile, 16px desktop
    lg: { mobile: 2, desktop: 3 },     // 16px mobile, 24px desktop
    xl: { mobile: 2.5, desktop: 4 },   // 20px mobile, 32px desktop
    xxl: { mobile: 3, desktop: 6 },    // 24px mobile, 48px desktop
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

  // Mobile-first responsive utilities
  mobile: {
    // Safe area insets for notched devices
    safeArea: {
      top: 'env(safe-area-inset-top)',
      bottom: 'env(safe-area-inset-bottom)',
      left: 'env(safe-area-inset-left)',
      right: 'env(safe-area-inset-right)',
    },
    
    // Mobile viewport units
    viewport: {
      fullHeight: '100dvh', // Dynamic viewport height
      smallHeight: '100svh', // Small viewport height
      largeHeight: '100lvh', // Large viewport height
    },

    // Mobile-optimized font sizes
    typography: {
      h1: { mobile: '1.75rem', desktop: '2.5rem' }, // 28px mobile, 40px desktop
      h2: { mobile: '1.5rem', desktop: '2rem' },    // 24px mobile, 32px desktop  
      h3: { mobile: '1.25rem', desktop: '1.5rem' }, // 20px mobile, 24px desktop
      h4: { mobile: '1.125rem', desktop: '1.25rem' }, // 18px mobile, 20px desktop
      body1: { mobile: '0.875rem', desktop: '1rem' }, // 14px mobile, 16px desktop
      body2: { mobile: '0.75rem', desktop: '0.875rem' }, // 12px mobile, 14px desktop
    },

    // Mobile interaction states
    interactions: {
      tapHighlight: 'transparent', // Remove iOS tap highlight
      userSelect: 'none', // Prevent text selection on buttons
      touchAction: 'manipulation', // Prevent zoom on double tap
    },
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
      fontSize: '1.75rem', // Mobile-first: 28px
      '@media (min-width:600px)': {
        fontSize: '2.5rem', // Desktop: 40px
      },
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.5rem', // Mobile-first: 24px
      '@media (min-width:600px)': {
        fontSize: '2rem', // Desktop: 32px
      },
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.25rem', // Mobile-first: 20px
      '@media (min-width:600px)': {
        fontSize: '1.5rem', // Desktop: 24px
      },
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.125rem', // Mobile-first: 18px
      '@media (min-width:600px)': {
        fontSize: '1.25rem', // Desktop: 20px
      },
    },
    body1: {
      fontSize: '0.875rem', // Mobile-first: 14px
      '@media (min-width:600px)': {
        fontSize: '1rem', // Desktop: 16px
      },
    },
    body2: {
      fontSize: '0.75rem', // Mobile-first: 12px
      '@media (min-width:600px)': {
        fontSize: '0.875rem', // Desktop: 14px
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0, // Mobile first
      sm: 600, // Small tablets
      md: 900, // Tablets
      lg: 1200, // Small laptops
      xl: 1536, // Large screens
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
