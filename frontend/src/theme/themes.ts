import { createTheme } from '@mui/material/styles';

// Custom theme constants (shared between light and dark themes)
export const themeConstants = {
  // Brand colors - Deep Blue Theme System for Hotel Management
  brandPrimary: '#1a237e',     // Deep blue - main brand color (Indigo 900)
  brandPrimaryLight: '#5c6bc0', // Light deep blue (Indigo 400)
  brandPrimaryDark: '#0d1657',  // Very dark blue
  brandSecondary: '#9e9e9e',   // Soft gray for secondary elements (Gray 500)
  brandAccent: '#ffd54f',      // Warm gold accent (Amber 300)
  
  // Deep Blue Color Palette for consistent theming
  greenPalette: {
    50: '#e8eaf6',
    100: '#c5cae9',
    200: '#9fa8da',
    300: '#7986cb',
    400: '#5c6bc0',
    500: '#3f51b5',   // Standard deep blue
    600: '#3949ab',
    700: '#303f9f',
    800: '#283593',   // Deep blue
    900: '#1a237e',   // Very dark blue - main brand
  },
  
  // UI Element specific colors derived from deep blue palette
  uiColors: {
    // Form elements
    inputFocus: '#1a237e',
    inputHover: '#283593',
    inputBorder: '#e8eaf6',
    
    // Buttons
    primaryButton: '#1a237e',
    primaryButtonHover: '#0d1657',
    primaryButtonPressed: '#0d1657',
    
    // Status indicators
    success: '#1a237e',  // Deep blue for success
    confirmed: '#1a237e', // Deep blue for confirmed status
    pending: '#ffd54f',   // Warm gold for pending
    error: '#d32f2f',     // Professional red
    
    // Steppers and progress
    stepperActive: '#1a237e',
    stepperCompleted: '#0d1657',
    stepperInactive: '#bdbdbd',
    
    // Cards and surfaces
    cardBorder: '#e8eaf6',
    cardHover: '#f3f4fb',
    surfaceElevated: '#ffffff',
  },
  
  // Legacy brand colors (keeping for backward compatibility)
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
  
  // Shadows and effects - DISABLED (no shadows required)
  shadows: {
    textShadow: 'none',
    cardShadow: 'none',
    buttonShadow: 'none'
  },
  
  // Border styles - 25% reduced opacity/thickness
  borders: {
    light: '1px solid',        // Keep thickness, opacity will be reduced in palette
    medium: '1px solid',       // Reduced from 2px to 1px
    dashed: '1px dashed'       // Reduced from 2px to 1px
  },
  
  // Scrollbar styles - different for light and dark themes
  scrollbar: {
    light: {
      width: 6,
      track: '#f1f1f1',
      thumb: '#c1c1c1',
      thumbRadius: 3,
      thumbHover: '#a8a8a8',
    },
    dark: {
      width: 6,
      track: '#2c2c2c',
      thumb: '#555555',
      thumbRadius: 3,
      thumbHover: '#777777',
    }
  },
  
  // Transparency values
  alpha: {
    low: 0.1,
    medium: 0.2,
    high: 0.3,
  },
  
  // Gradient styles - Navy blue theme for hotel management
  gradients: {
    light: {
      primaryButton: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',  // Navy blue gradient
      secondaryButton: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', // Medium blue gradient
      successButton: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',  // Blue for success
      heroBackground: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)', // Blue hero background
    },
    dark: {
      primaryButton: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)',  // Lighter orange for dark mode
      secondaryButton: 'linear-gradient(135deg, #ff8a65 0%, #ff7043 100%)', // Orange for secondary
      successButton: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',  // Green for success
      heroBackground: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)',
    }
  },
  
  // Performance-optimized animation styles
  animations: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease', 
    slow: 'all 0.3s ease',
    none: 'none',
  },
  
  // Lightweight shadow alternatives - DISABLED (no shadows required)
  lightShadows: {
    light: {
      minimal: 'none',
      light: 'none', 
      medium: 'none',
    },
    dark: {
      minimal: 'none',
      light: 'none', 
      medium: 'none',
    }
  },
};

// Base theme configuration
const baseThemeConfig = {
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
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '&::-webkit-scrollbar': {
            width: '6px',
          },
        },
      },
    },
  },
};

// Light Theme  
const lightThemeBase = createTheme({
  ...baseThemeConfig,
  palette: {
    mode: 'light',
    primary: {
      main: '#1a237e',      // Deep blue as primary
      light: '#5c6bc0',
      dark: '#0d1657',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9e9e9e',  // Soft gray as secondary
      light: '#e0e0e0',
      dark: '#616161',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
    success: {
      main: themeConstants.uiColors.success,
      light: themeConstants.greenPalette[100],
      dark: themeConstants.greenPalette[800],
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffd54f',  // Warm gold accent
      light: '#fff9c4',
      dark: '#ffb300',
      contrastText: '#000000',
    },
    info: {
      main: '#1a237e',
      light: '#e8eaf6',
      dark: '#0d1657',
      contrastText: '#ffffff',
    },
    error: {
      main: themeConstants.uiColors.error,
      light: '#ffebee',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    // Custom palette extensions - 25% reduced border opacity
    divider: 'rgba(227, 242, 253, 0.75)', // 25% reduction from themeConstants.greenPalette[200]
    action: {
      hover: 'rgba(227, 242, 253, 0.38)',   // 25% reduction from greenPalette[50]
      selected: 'rgba(187, 222, 251, 0.75)', // 25% reduction from greenPalette[100]
    },
  },
  components: {
    ...baseThemeConfig.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '&::-webkit-scrollbar': {
            width: themeConstants.scrollbar.light.width,
          },
          '&::-webkit-scrollbar-track': {
            background: themeConstants.scrollbar.light.track,
          },
          '&::-webkit-scrollbar-thumb': {
            background: themeConstants.scrollbar.light.thumb,
            borderRadius: themeConstants.scrollbar.light.thumbRadius,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: themeConstants.scrollbar.light.thumbHover,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none', // Remove shadow
          '&:hover': {
            boxShadow: 'none', // Remove hover shadow
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${themeConstants.uiColors.primaryButton} 0%, ${themeConstants.uiColors.primaryButtonHover} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${themeConstants.uiColors.primaryButtonHover} 0%, ${themeConstants.uiColors.primaryButtonPressed} 100%)`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: themeConstants.uiColors.inputHover,
            },
            '&.Mui-focused fieldset': {
              borderColor: themeConstants.uiColors.inputFocus,
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: themeConstants.uiColors.inputFocus,
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepIcon-root.Mui-active': {
            color: themeConstants.uiColors.stepperActive,
          },
          '& .MuiStepIcon-root.Mui-completed': {
            color: themeConstants.uiColors.stepperCompleted,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // Remove shadow
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // Remove shadow
          border: '1px solid rgba(232, 245, 232, 0.75)', // Add reduced border instead
          '&:hover': {
            boxShadow: 'none', // Remove hover shadow
            borderColor: 'rgba(165, 214, 167, 0.75)', // 25% reduced border on hover
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: themeConstants.brandPrimary,
          color: '#ffffff',
        },
        colorSuccess: {
          backgroundColor: themeConstants.uiColors.success,
          color: '#ffffff',
        },
      },
    },
  },
});

// Extend light theme with custom properties
const extendedLightTheme = createTheme(lightThemeBase, {
  custom: {
    constants: {
      ...themeConstants,
      scrollbar: themeConstants.scrollbar.light,
      gradients: themeConstants.gradients.light,
      lightShadows: themeConstants.lightShadows.light,
    },
  },
} as any);

// Dark Theme
const darkThemeBase = createTheme({
  ...baseThemeConfig,
  palette: {
    mode: 'dark',
    primary: {
      main: '#5c6bc0',  // Light deep blue for dark mode
      light: '#9fa8da',
      dark: '#3949ab',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#bdbdbd',  // Light gray for dark mode
      light: '#e0e0e0',
      dark: '#9e9e9e',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
    success: {
      main: themeConstants.greenPalette[400], // Lighter green for dark mode
      light: themeConstants.greenPalette[200],
      dark: themeConstants.greenPalette[600],
      contrastText: '#000000',
    },
    warning: {
      main: '#ffd54f',  // Warm gold accent for dark mode
      light: '#ffe082',
      dark: '#ffb300',
      contrastText: '#000000',
    },
    info: {
      main: '#5c6bc0',  // Deep blue for info
      light: '#9fa8da',
      dark: '#3949ab',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef5350',
      light: '#ffcdd2',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    divider: 'rgba(51, 51, 51, 0.75)', // 25% reduced opacity
    action: {
      hover: 'rgba(76, 175, 80, 0.06)', // 25% reduction from 0.08
      selected: 'rgba(76, 175, 80, 0.09)', // 25% reduction from 0.12
    },
  },
  components: {
    ...baseThemeConfig.components,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#121212',
          '&::-webkit-scrollbar': {
            width: themeConstants.scrollbar.dark.width,
          },
          '&::-webkit-scrollbar-track': {
            background: themeConstants.scrollbar.dark.track,
          },
          '&::-webkit-scrollbar-thumb': {
            background: themeConstants.scrollbar.dark.thumb,
            borderRadius: themeConstants.scrollbar.dark.thumbRadius,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: themeConstants.scrollbar.dark.thumbHover,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          boxShadow: 'none', // Remove shadow
          '&:hover': {
            boxShadow: 'none', // Remove hover shadow
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${themeConstants.greenPalette[400]} 0%, ${themeConstants.greenPalette[500]} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${themeConstants.greenPalette[500]} 0%, ${themeConstants.greenPalette[600]} 100%)`,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(85, 85, 85, 0.75)', // 25% reduced from #555555
            },
            '&:hover fieldset': {
              borderColor: `rgba(102, 187, 106, 0.75)`, // 25% reduced opacity
            },
            '&.Mui-focused fieldset': {
              borderColor: `rgba(129, 199, 132, 0.75)`, // 25% reduced opacity
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: themeConstants.greenPalette[300],
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepIcon-root.Mui-active': {
            color: themeConstants.greenPalette[400],
          },
          '& .MuiStepIcon-root.Mui-completed': {
            color: themeConstants.greenPalette[500],
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
          boxShadow: 'none', // Remove shadow
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          boxShadow: 'none', // Remove shadow
          border: '1px solid rgba(51, 51, 51, 0.75)', // Add reduced border instead
          '&:hover': {
            boxShadow: 'none', // Remove hover shadow
            borderColor: 'rgba(76, 175, 80, 0.15)', // Subtle green border on hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
          borderRight: '1px solid #333333',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: themeConstants.greenPalette[500],
          color: '#ffffff',
        },
        colorSuccess: {
          backgroundColor: themeConstants.greenPalette[400],
          color: '#000000',
        },
      },
    },
  },
});

// Extend dark theme with custom properties
const extendedDarkTheme = createTheme(darkThemeBase, {
  custom: {
    constants: {
      ...themeConstants,
      scrollbar: themeConstants.scrollbar.dark,
      gradients: themeConstants.gradients.dark,
      lightShadows: themeConstants.lightShadows.dark,
    },
  },
} as any);

// Type declarations are already defined in theme.ts

// Export the extended themes
export { extendedLightTheme as lightTheme, extendedDarkTheme as darkTheme };

// Export the original light theme for backward compatibility  
export default extendedLightTheme;

// Helper function to get theme colors by mode
export const getThemeColors = (mode: 'light' | 'dark' = 'light') => {
  return {
    gradients: themeConstants.gradients[mode],
    colors: themeConstants.uiColors,
    palette: mode === 'light' ? extendedLightTheme.palette : extendedDarkTheme.palette,
  };
};