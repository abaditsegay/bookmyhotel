import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { designSystem } from '../../theme/designSystem';
import { getReadableAccentTextColor } from '../../theme/surfaces';

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
      sx={(theme) => {
        const paletteColor = props.color && props.color !== 'inherit' ? props.color : 'primary';
        const tone = paletteColor in theme.palette
          ? theme.palette[paletteColor as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info']
          : theme.palette.primary;
        const textVariantColor = theme.palette.mode === 'dark' ? tone.light : tone.main;
        const readableAccentColor = getReadableAccentTextColor(
          theme,
          (paletteColor in theme.palette ? paletteColor : 'primary') as 'primary' | 'secondary' | 'info' | 'warning' | 'error'
        );

        return {
          ...sizeConfig,
          textTransform: 'none',
          borderRadius: `${designSystem.borderRadius.md}px`,
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.24s ease-in-out',
          ...(variant === 'contained' && {
            backgroundColor: tone.main,
            color: tone.contrastText,
            boxShadow: gradient || elevated ? designSystem.shadows.card : 'none',
            '&:hover': {
              backgroundColor: tone.dark,
              boxShadow: elevated ? designSystem.shadows.cardHover : designSystem.shadows.sm,
              transform: elevated ? 'translateY(-1px)' : 'none',
            },
            '&:active': {
              boxShadow: 'none',
              transform: 'none',
            },
          }),
          ...(variant === 'outlined' && {
            borderWidth: '1px',
            borderColor: theme.palette.mode === 'dark' ? alpha(readableAccentColor, 0.7) : tone.main,
            color: readableAccentColor,
            backgroundColor: 'transparent',
            '&:hover': {
              borderWidth: '1px',
              borderColor: theme.palette.mode === 'dark' ? readableAccentColor : tone.main,
              backgroundColor: alpha(theme.palette.mode === 'dark' ? readableAccentColor : tone.main, theme.palette.mode === 'dark' ? 0.14 : 0.04),
            },
          }),
          ...(variant === 'text' && {
            color: textVariantColor,
            '&:hover': {
              backgroundColor: alpha(textVariantColor, theme.palette.mode === 'dark' ? 0.16 : 0.06),
            },
          }),
          ...(typeof sx === 'function' ? sx(theme) : sx),
        };
      }}
      {...props}
    >
      {loading ? (loadingText || children) : children}
    </Button>
  );
};

export default StandardButton;