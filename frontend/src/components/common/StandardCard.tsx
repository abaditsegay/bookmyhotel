import React from 'react';
import { Card, CardProps, useTheme } from '@mui/material';
import { designSystem } from '../../theme/designSystem';
import { COLORS, addAlpha } from '../../theme/themeColors';

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
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 1px ${theme.palette.primary.main}20`,
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
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
          border: `1px solid ${theme.palette.primary.main}20`,
          boxShadow: designSystem.shadows.sm,
          transition: 'all 0.2s ease',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
            boxShadow: designSystem.shadows.md,
          },
        };
      case 'glass':
        return {
          background: addAlpha(COLORS.WHITE, 0.85),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${addAlpha(COLORS.WHITE, 0.2)}`,
          boxShadow: designSystem.shadows.md,
          transition: 'all 0.2s ease',
          '&:hover': {
            background: addAlpha(COLORS.WHITE, 0.95),
            boxShadow: designSystem.shadows.lg,
          },
        };
      default:
        return {
          boxShadow: designSystem.shadows.sm,
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
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