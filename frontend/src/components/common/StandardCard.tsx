import React from 'react';
import { Card, CardProps, useTheme } from '@mui/material';

interface StandardCardProps extends Omit<CardProps, 'variant'> {
  cardVariant?: 'default' | 'outlined' | 'elevated';
}

/**
 * Standardized Card component with consistent styling
 * Extends Material-UI Card with theme-consistent shadows and spacing
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