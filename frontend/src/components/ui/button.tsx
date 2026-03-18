// Enhanced Button Component
// Extends Material-UI Button with consistent styling and additional variants

import React from 'react';
import { 
  Button as MuiButton, 
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Box 
} from '@mui/material';
import { designSystem } from '../../theme/designSystem';

interface ButtonProps extends Omit<MuiButtonProps, 'size'> {
  /** Button size following design system */
  size?: 'small' | 'medium' | 'large';
  /** Loading state with spinner */
  loading?: boolean;
  /** Icon to display before text */
  startIcon?: React.ReactNode;
  /** Icon to display after text */
  endIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  loading = false,
  disabled,
  startIcon,
  endIcon,
  size = 'medium',
  sx,
  ...props
}) => {
  const getSizeStyles = (buttonSize: 'small' | 'medium' | 'large') => {
    switch (buttonSize) {
      case 'small':
        return {
          minHeight: '36px',
          padding: '8px 16px',
          fontSize: '0.75rem'
        };
      case 'large':
        return {
          minHeight: '52px',
          padding: '12px 32px',
          fontSize: '1rem'
        };
      default:
        return {
          minHeight: '44px',
          padding: '10px 24px',
          fontSize: '0.875rem'
        };
    }
  };

  const sizeStyles = getSizeStyles(size);
  const isDisabled = disabled || loading;

  return (
    <MuiButton
      {...props}
      disabled={isDisabled}
      startIcon={loading ? undefined : startIcon}
      endIcon={loading ? undefined : endIcon}
      sx={{
        ...sizeStyles,
        borderRadius: designSystem.borderRadius.md,
        textTransform: 'none',
        fontWeight: 500,
        position: 'relative',
        ...(loading && {
          color: 'transparent',
        }),
        ...sx,
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress
            size={20}
            sx={{
              color: 'currentColor',
            }}
          />
        </Box>
      )}
      {children}
    </MuiButton>
  );
};

export { Button };
export default Button;