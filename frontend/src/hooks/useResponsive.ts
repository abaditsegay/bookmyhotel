import { useTheme, useMediaQuery } from '@mui/material';
import { Breakpoint } from '@mui/material/styles';

/**
 * Custom hook for responsive design utilities
 * Provides mobile-first responsive breakpoint detection and utilities
 */
export const useResponsive = () => {
  const theme = useTheme();
  
  // Breakpoint detection
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // < 600px
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')); // 600px - 900px
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >= 900px
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg')); // >= 1200px
  
  // Specific device detection
  const isSmallMobile = useMediaQuery('(max-width:480px)'); // Very small phones
  const isMediumMobile = useMediaQuery('(min-width:481px) and (max-width:599px)'); // Regular phones
  const isLandscape = useMediaQuery('(orientation: landscape)');
  const isPortrait = useMediaQuery('(orientation: portrait)');
  
  // Touch device detection
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  const canHover = useMediaQuery('(hover: hover)');
  
  /**
   * Get responsive value based on current breakpoint
   */
  const getResponsiveValue = <T>(values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
  }): T | undefined => {
    if (theme.breakpoints.up('xl') && values.xl !== undefined) return values.xl;
    if (theme.breakpoints.up('lg') && values.lg !== undefined) return values.lg;
    if (theme.breakpoints.up('md') && values.md !== undefined) return values.md;
    if (theme.breakpoints.up('sm') && values.sm !== undefined) return values.sm;
    return values.xs;
  };

  /**
   * Get mobile-optimized spacing based on current breakpoint
   */
  const getResponsiveSpacing = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl') => {
    const mobileSpacing = (theme.custom as any)?.constants?.mobileSpacing?.[size];
    if (mobileSpacing) {
      return isMobile ? mobileSpacing.mobile : mobileSpacing.desktop;
    }
    return (theme.custom as any)?.constants?.spacing?.[size] || 1;
  };

  /**
   * Get touch-optimized button height
   */
  const getTouchButtonHeight = (size: 'small' | 'medium' | 'large') => {
    const touchTargets = (theme.custom as any)?.constants?.touchTargets;
    if (isTouchDevice && touchTargets) {
      return size === 'small' ? touchTargets.minimum : 
             size === 'medium' ? touchTargets.comfortable : 
             touchTargets.large;
    }
    return (theme.custom as any)?.constants?.buttonSizes?.[size]?.height || 40;
  };

  /**
   * Get current breakpoint name
   */
  const getCurrentBreakpoint = (): Breakpoint => {
    if (useMediaQuery(theme.breakpoints.up('xl'))) return 'xl';
    if (useMediaQuery(theme.breakpoints.up('lg'))) return 'lg';
    if (useMediaQuery(theme.breakpoints.up('md'))) return 'md';
    if (useMediaQuery(theme.breakpoints.up('sm'))) return 'sm';
    return 'xs';
  };

  return {
    // Breakpoint detection
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    isSmallMobile,
    isMediumMobile,
    
    // Device capabilities
    isTouchDevice,
    canHover,
    isLandscape,
    isPortrait,
    
    // Utility functions
    getResponsiveValue,
    getResponsiveSpacing,
    getTouchButtonHeight,
    getCurrentBreakpoint,
    
    // Theme references
    theme,
    breakpoints: theme.breakpoints,
  };
};

/**
 * Responsive spacing utility
 */
export const useResponsiveSpacing = () => {
  const { getResponsiveSpacing } = useResponsive();
  
  return {
    xs: getResponsiveSpacing('xs'),
    sm: getResponsiveSpacing('sm'),
    md: getResponsiveSpacing('md'),
    lg: getResponsiveSpacing('lg'),
    xl: getResponsiveSpacing('xl'),
    xxl: getResponsiveSpacing('xxl'),
  };
};

export default useResponsive;