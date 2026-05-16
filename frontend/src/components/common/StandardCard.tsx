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

  const getCardStyles = () => {
    switch (cardVariant) {
      case 'outlined':
        return {
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: designSystem.shadows.sm,
            transform: 'translateY(-1px)',
          },
        };
      case 'elevated':
        return {
          boxShadow: designSystem.shadows.card,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: designSystem.shadows.cardHover,
            transform: 'translateY(-2px)',
          },
        };
      case 'gradient':
        return {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: designSystem.shadows.sm,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: designSystem.shadows.md,
          },
        };
      case 'glass':
        return {
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.94 : 0.98),
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: designSystem.shadows.sm,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
            boxShadow: designSystem.shadows.md,
          },
        };
      default:
        return {
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          boxShadow: designSystem.shadows.sm,
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.14),
            boxShadow: designSystem.shadows.md,
          },
        };
    }
  };

  return (
    <Card
      sx={{
        borderRadius: designSystem.borderRadius.md,
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