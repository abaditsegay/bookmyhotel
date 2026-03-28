import { SxProps, Theme } from '@mui/material/styles';

import { designSystem } from './designSystem';
import { COLORS, addAlpha } from './themeColors';

export type AppSx = SxProps<Theme>;

export const pageShellSx: AppSx = {
  p: { xs: 2, md: 4 },
  minHeight: '100vh',
  backgroundColor: designSystem.colors.background.default,
};

export const pageHeaderContentSx: AppSx = {
  maxWidth: 840,
};

export const pageHeaderActionsSx: AppSx = {
  width: '100%',
  justifyContent: { xs: 'stretch', sm: 'flex-end' },
};

export const surfaceCardSx = (variant: 'default' | 'subtle' | 'elevated' = 'default'): AppSx => {
  const variants: Record<typeof variant, AppSx> = {
    default: {
      backgroundColor: designSystem.colors.background.paper,
      boxShadow: 'none',
    },
    subtle: {
      backgroundColor: addAlpha(COLORS.WHITE, 0.9),
      boxShadow: 'none',
    },
    elevated: {
      backgroundColor: designSystem.colors.background.paper,
      boxShadow: designSystem.shadows.card,
    },
  };

  return {
    borderRadius: designSystem.borderRadius.lg,
    overflow: 'hidden',
    ...variants[variant],
  };
};

export const surfaceCardContentSx: AppSx = {
  p: { xs: 2.5, md: 3.5 },
};

export const infoPanelSx: AppSx = {
  p: 2,
  borderRadius: designSystem.borderRadius.lg,
  backgroundColor: addAlpha(COLORS.PRIMARY, 0.04),
};

export const sectionTitleRowSx: AppSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  mb: 1,
};

export const actionRowSx: AppSx = {
  direction: { xs: 'column', sm: 'row' },
  spacing: 1.5,
  justifyContent: 'flex-end',
};