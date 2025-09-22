import React from 'react';
import { Card, CardProps, useTheme } from '@mui/material';

interface StandardCardProps extends Omit<CardProps, 'variant'> {
  cardVariant?: 'default' | 'outlined' | 'elevated';
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
        };
      case 'elevated':
        return {
          boxShadow: theme.custom.constants.shadows.cardShadow,
        };
      default:
        return {
          boxShadow: theme.custom.constants.lightShadows.light,
        };
    }
  };

  return (
    <Card
      sx={{
        borderRadius: theme.shape.borderRadius,
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