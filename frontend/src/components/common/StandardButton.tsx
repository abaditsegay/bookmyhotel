import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { themeConstants } from '../../theme/theme';

interface StandardButtonProps extends Omit<ButtonProps, 'size'> {
  buttonSize?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
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
  children,
  sx,
  ...props
}) => {
  const sizeConfig = themeConstants.buttonSizes[buttonSize];

  return (
    <Button
      variant={variant}
      fullWidth={fullWidth}
      sx={{
        ...sizeConfig,
        textTransform: 'none', // More modern look without all-caps
        borderRadius: themeConstants.spacing.xs, // Consistent border radius
        fontWeight: 600,
        transition: 'all 0.2s ease-in-out',
        
        // Variant-specific styling
        ...(variant === 'contained' && {
          boxShadow: themeConstants.shadows.buttonShadow,
          '&:hover': {
            boxShadow: themeConstants.shadows.cardShadow,
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: themeConstants.shadows.buttonShadow,
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