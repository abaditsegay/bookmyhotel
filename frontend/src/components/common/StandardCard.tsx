import React from 'react';
import { Card, CardProps, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { designSystem } from '../../theme/designSystem';

interface StandardCardProps extends Omit<CardProps, 'variant'> {
  cardVariant?: 'default' | 'outlined' | 'elevated' | 'gradient' | 'glass';
}

/**
 * StandardCard - A themed card component with consistent styling across the application
 * 
 * @description
 * Extends Material-UI Card with predefined variants that follow our design system.
 * Provides consistent elevation, shadows, and border radius throughout the app.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <StandardCard cardVariant="default">
 *   <CardContent>Content here</CardContent>
 * </StandardCard>
 * 
 * // Elevated card for emphasis
 * <StandardCard cardVariant="elevated">
 *   <CardContent>Important content</CardContent>
 * </StandardCard>
 * ```
 * 
 * @param cardVariant - Visual variant: 'default' (subtle shadow), 'outlined' (border only), 'elevated' (prominent shadow)
 * @param children - Card content
 * @param sx - Additional Material-UI styling overrides
 * @param props - All other Material-UI Card props (except 'variant' which conflicts with cardVariant)
 */
const StandardCard: React.FC<StandardCardProps> = ({ 
  children, 
  cardVariant = 'default',
  sx,
  ...props 
}) => {
  const theme = useTheme();
  const sharedSurfaceRadius = 4;
  const sharedSurfaceBackground = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.82 : 0.93);

  const getCardStyles = () => {
    switch (cardVariant) {
      case 'outlined':
        return {
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          backgroundColor: sharedSurfaceBackground,
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
        };
      case 'elevated':
        return {
          backgroundColor: sharedSurfaceBackground,
          boxShadow: theme.palette.mode === 'dark' ? '0 10px 24px rgba(2, 6, 23, 0.24)' : designSystem.shadows.xs,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark' ? '0 14px 28px rgba(2, 6, 23, 0.28)' : designSystem.shadows.sm,
            transform: 'translateY(-2px)',
          },
        };
      case 'gradient':
        return {
          backgroundColor: sharedSurfaceBackground,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: theme.palette.mode === 'dark' ? '0 12px 24px rgba(2, 6, 23, 0.22)' : designSystem.shadows.xs,
          },
        };
      case 'glass':
        return {
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.76 : 0.9),
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: sharedSurfaceBackground,
            boxShadow: theme.palette.mode === 'dark' ? '0 12px 24px rgba(2, 6, 23, 0.2)' : designSystem.shadows.xs,
          },
        };
      default:
        return {
          backgroundColor: sharedSurfaceBackground,
          border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.08)}`,
          boxShadow: 'none',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.14),
            boxShadow: theme.palette.mode === 'dark' ? '0 12px 24px rgba(2, 6, 23, 0.18)' : designSystem.shadows.xs,
          },
        };
    }
  };

  return (
    <Card
      sx={{
        borderRadius: sharedSurfaceRadius,
        overflow: 'hidden',
        ...getCardStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default StandardCard;