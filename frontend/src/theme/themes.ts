import { createTheme } from '@mui/material/styles';

// Custom theme constants (shared between light and dark themes)
export const themeConstants = {
  // Brand colors - Green Theme System
  brandPrimary: '#4caf50',     // Main green color from your design
  brandPrimaryLight: '#81c784',
  brandPrimaryDark: '#388e3c',
  brandSecondary: '#66bb6a',   // Complementary green
  brandAccent: '#a5d6a7',      // Light green accent
  
  // Green Color Palette for consistent theming
  greenPalette: {
    50: '#e8f5e8',
    100: '#c8e6c8',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',   // Main brand green
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  
  // UI Element specific colors derived from green palette
  uiColors: {
    // Form elements
    inputFocus: '#4caf50',
    inputHover: '#66bb6a',
    inputBorder: '#a5d6a7',
    
    // Buttons
    primaryButton: '#4caf50',
    primaryButtonHover: '#43a047',
    primaryButtonPressed: '#388e3c',
    
    // Status indicators
    success: '#4caf50',
    confirmed: '#1976d2',  // Blue for confirmed status as per your system
    pending: '#ff9800',
    error: '#f44336',
    
    // Steppers and progress
    stepperActive: '#4caf50',
    stepperCompleted: '#388e3c',
    stepperInactive: '#e0e0e0',
    
    // Cards and surfaces
    cardBorder: '#e8f5e8',
    cardHover: '#f1f8e9',
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
  
  // Gradient styles - different for light and dark themes
  gradients: {
    light: {
      primaryButton: 'linear-gradient(135deg, #4caf50 0%, #43a047 100%)',  // Green gradient to match primary color
      secondaryButton: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', // Blue gradient for secondary actions
      successButton: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
      heroBackground: 'linear-gradient(135deg, #4caf50 0%, #43a047 100%)', // Green hero to match brand
    },
    dark: {
      primaryButton: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',  // Lighter green for dark mode
      secondaryButton: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)', // Blue for secondary
      successButton: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
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
      main: themeConstants.brandPrimary,      // Green as primary
      light: themeConstants.brandPrimaryLight,
      dark: themeConstants.brandPrimaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1976d2',  // Blue as secondary (for confirmed status, etc.)
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
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
      main: themeConstants.uiColors.pending,
      light: '#FFF5F0',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    info: {
      main: '#2196f3',
      light: '#e3f2fd',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    error: {
      main: themeConstants.uiColors.error,
      light: '#ffebee',
      dark: '#d32f2f',
      contrastText: '#ffffff',
    },
    // Custom palette extensions - 25% reduced border opacity
    divider: 'rgba(232, 245, 232, 0.75)', // 25% reduction from themeConstants.greenPalette[200]
    action: {
      hover: 'rgba(232, 245, 232, 0.38)',   // 25% reduction from greenPalette[50]
      selected: 'rgba(200, 230, 200, 0.75)', // 25% reduction from greenPalette[100]
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
      main: themeConstants.brandPrimaryLight,  // Lighter green for dark mode
      light: themeConstants.greenPalette[300],
      dark: themeConstants.brandPrimary,
      contrastText: '#000000',
    },
    secondary: {
      main: '#64b5f6',  // Lighter blue for dark mode
      light: '#90caf9',
      dark: '#42a5f5',
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
      main: '#ffb74d',
      light: '#ffcc80',
      dark: '#ff9800',
      contrastText: '#000000',
    },
    info: {
      main: '#64b5f6',
      light: '#90caf9',
      dark: '#42a5f5',
      contrastText: '#000000',
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