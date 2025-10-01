import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { designSystem } from '../../theme/designSystem';

interface StandardButtonProps extends Omit<ButtonProps, 'size'> {
  buttonSize?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  gradient?: boolean;
  elevated?: boolean;
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
 * // Secondary action
 * <StandardButton buttonSize="medium" variant="outlined">
 *   Cancel
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
 * @param children - Button content (text, icons, etc.)
 * @param sx - Additional Material-UI styling overrides
 */
const StandardButton: React.FC<StandardButtonProps> = ({
  buttonSize = 'medium',
  fullWidth = false,
  variant = 'contained',
  gradient = false,
  elevated = false,
  children,
  sx,
  ...props
}) => {
  const getSizeConfig = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return { height: '36px', padding: '8px 16px' };
      case 'large':
        return { height: '52px', padding: '12px 32px' };
      default:
        return { height: '44px', padding: '10px 24px' };
    }
  };
  const sizeConfig = getSizeConfig(buttonSize);

  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      sx={{
        ...sizeConfig,
        textTransform: 'none', // More modern look without all-caps
        borderRadius: designSystem.borderRadius.md, // Consistent border radius
        fontWeight: 600,
        transition: 'all 0.2s ease-in-out',
        
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
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }),
        
        ...(variant === 'text' && {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        }),
        
        // Custom sx overrides
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default StandardButton;