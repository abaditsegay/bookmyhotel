// Enhanced Card Component
// Consistent card styling with design system integration

import React from 'react';
import { 
  Card as MuiCard, 
  CardProps as MuiCardProps,
  CardContent,
  CardHeader,
  CardActions,
  Typography,
  Box
} from '@mui/material';
import { designSystem } from '../../theme/designSystem';

interface CardProps extends Omit<MuiCardProps, 'variant'> {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card actions (buttons, etc.) */
  actions?: React.ReactNode;
  /** Remove default padding from content */
  noPadding?: boolean;
  /** Card visual variant */
  cardVariant?: 'default' | 'outlined' | 'elevated';
  /** Loading state */
  loading?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  noPadding = false,
  cardVariant = 'default',
  loading = false,
  sx,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (cardVariant) {
      case 'outlined':
        return {
          border: `1px solid ${designSystem.colors.divider}`,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: designSystem.shadows.sm,
          }
        };
      case 'elevated':
        return {
          boxShadow: designSystem.shadows.lg,
          '&:hover': {
            boxShadow: designSystem.shadows.xl,
          }
        };
      default:
        return {
          border: `1px solid ${designSystem.colors.primary[50]}`,
          boxShadow: designSystem.shadows.card,
          '&:hover': {
            boxShadow: designSystem.shadows.cardHover,
          }
        };
    }
  };

  const variantStyles = getVariantStyles();

  if (loading) {
    return (
      <MuiCard
        sx={{
          ...variantStyles,
          borderRadius: designSystem.borderRadius.lg,
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
        {...props}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid',
              borderColor: `${designSystem.colors.primary.main} transparent ${designSystem.colors.primary.main} ${designSystem.colors.primary.main}`,
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      </MuiCard>
    );
  }

  return (
    <MuiCard
      sx={{
        ...variantStyles,
        borderRadius: designSystem.borderRadius.lg,
        transition: `all 250ms ease-in-out`,
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title && (
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          )}
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          sx={{
            pb: subtitle ? 1 : 2,
          }}
        />
      )}
      
      <CardContent
        sx={{
          pt: (title || subtitle) ? 0 : undefined,
          ...(noPadding && { padding: 0, '&:last-child': { paddingBottom: 0 } }),
        }}
      >
        {children}
      </CardContent>
      
      {actions && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          {actions}
        </CardActions>
      )}
    </MuiCard>
  );
};

export default Card;