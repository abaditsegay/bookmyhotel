import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { designSystem } from '../../theme/designSystem';
import { COLORS, addAlpha } from '../../theme/themeColors';

interface StandardButtonProps extends Omit<ButtonProps, 'size'> {
  buttonSize?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  gradient?: boolean;
  elevated?: boolean;
  loading?: boolean;
  loadingText?: string;
}

/**
 * StandardButton - A themed button component with consistent styling and behavior
 * 
 * @description
 * Extends Material-UI Button with standardized sizing, elevation, and interaction states.
 * Uses theme constants for consistent spacing and provides smooth transitions.
 * 
 * @example
 * ```tsx
 * // Primary action button
 * <StandardButton buttonSize="large" variant="contained">
 *   Book Now
 * </StandardButton>
 * 
 * // With loading state
 * <StandardButton 
 *   loading={isSubmitting}
 *   loadingText="Processing..."
 *   onClick={handleSubmit}
 * >
 *   Submit
 * </StandardButton>
 * 
 * // Mobile-friendly full width
 * <StandardButton fullWidth variant="contained">
 *   Continue
 * </StandardButton>
 * ```
 * 
 * @param buttonSize - Size variant: 'small' (32px), 'medium' (40px), 'large' (48px)
 * @param fullWidth - Whether button should take full width of container
 * @param variant - Material-UI button variant: 'text', 'outlined', 'contained'
 * @param loading - Show loading spinner and disable button
 * @param loadingText - Text to show while loading (defaults to children)
 * @param children - Button content (text, icons, etc.)
 * @param sx - Additional Material-UI styling overrides
 */
const StandardButton: React.FC<StandardButtonProps> = ({
  buttonSize = 'medium',
  fullWidth = false,
  variant = 'contained',
  gradient = false,
  elevated = false,
  loading = false,
  loadingText,
  children,
  sx,
  ...props
}) => {
  const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return { height: '38px', padding: '8px 20px', fontSize: '0.875rem' };
      case 'large':
        return { height: '56px', padding: '14px 36px', fontSize: '1.125rem' };
      default:
        return { height: '48px', padding: '12px 28px', fontSize: '1rem' };
    }
  };
  
  const getSpinnerSize = () => {
    switch (buttonSize) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };
  
  const sizeConfig = getSizeConfig(buttonSize);

  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      disabled={loading || props.disabled}
      startIcon={loading ? <CircularProgress size={getSpinnerSize()} color="inherit" /> : props.startIcon}
      sx={{
        ...sizeConfig,
        textTransform: 'none', // More modern look without all-caps
        borderRadius: 2, // Larger border radius for modern look
        fontWeight: 600,
        boxShadow: variant === 'contained' ? 2 : 0,
        transition: 'all 0.3s ease-in-out',
        
        // Gradient styling
        ...(gradient && variant === 'contained' && {
          background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          '&:hover': {
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          },
        }),
        
        // Elevated styling
        ...(elevated && {
          boxShadow: designSystem.shadows.lg,
          '&:hover': {
            boxShadow: designSystem.shadows.xl,
            transform: 'translateY(-2px)',
          },
        }),
        
        // Variant-specific styling
        ...(variant === 'contained' && !gradient && {
          boxShadow: designSystem.shadows.sm,
          '&:hover': {
            boxShadow: designSystem.shadows.md,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: designSystem.shadows.sm,
          },
        }),
        
        ...(variant === 'outlined' && {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: addAlpha(COLORS.BLACK, 0.04),
          },
        }),
        
        ...(variant === 'text' && {
          '&:hover': {
            backgroundColor: addAlpha(COLORS.BLACK, 0.04),
          },
        }),
        
        // Custom sx overrides
        ...sx,
      }}
      {...props}
    >
      {loading ? (loadingText || children) : children}
    </Button>
  );
};

export default StandardButton;