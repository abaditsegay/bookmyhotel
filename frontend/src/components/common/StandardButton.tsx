import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { themeConstants } from '../../theme/theme';

interface StandardButtonProps extends Omit<ButtonProps, 'size'> {
  buttonSize?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

/**
 * StandardButton - A themed button component with consistent styling
 * 
 * Features:
 * - Theme-aware sizing using buttonSizes from themeConstants
 * - Consistent elevation and transitions
 * - Customizable variants (text, outlined, contained)
 * - Full width option for mobile-friendly layouts
 * - Hover and focus states with smooth transitions
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