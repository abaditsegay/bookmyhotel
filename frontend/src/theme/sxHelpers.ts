import { alpha, SxProps, SystemStyleObject, Theme } from '@mui/material/styles';

import { designSystem } from './designSystem';
import { getReadableAccentTextColor } from './surfaces';

export type AppSx = SxProps<Theme>;

const resolveSx = (theme: Theme, style?: AppSx): SystemStyleObject<Theme> => {
  if (!style) {
    return {};
  }

  if (Array.isArray(style)) {
    return style.reduce<SystemStyleObject<Theme>>((accumulator, item) => {
      if (!item) {
        return accumulator;
      }

      return {
        ...accumulator,
        ...resolveSx(theme, item),
      };
    }, {});
  }

  if (typeof style === 'function') {
    return resolveSx(theme, style(theme));
  }

  return style;
};

export const composeSx = (...styles: Array<AppSx | undefined>): AppSx => theme => {
  return styles.reduce<SystemStyleObject<Theme>>((accumulator, style) => {
    return {
      ...accumulator,
      ...resolveSx(theme, style),
    };
  }, {});
};

export const pageShellSx: AppSx = theme => ({
  p: { xs: 2, md: 4 },
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
});

export const pageHeaderContentSx: AppSx = {
  maxWidth: 840,
};

export const pageHeaderActionsSx: AppSx = {
  width: '100%',
  justifyContent: { xs: 'stretch', sm: 'flex-end' },
};

export const surfaceCardSx = (variant: 'default' | 'subtle' | 'elevated' = 'default'): AppSx => theme => {
  const borderColor = theme.palette.divider;
  const sharedSurfaceBackground = alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.84 : 0.94);
  const sharedSurfaceRadius = Math.max(4, designSystem.borderRadius.sm / 2);

  const variants = {
    default: {
      backgroundColor: sharedSurfaceBackground,
      boxShadow: 'none',
      border: `1px solid ${borderColor}`,
    },
    subtle: {
      backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.78 : 0.9),
      boxShadow: 'none',
      border: `1px solid ${borderColor}`,
    },
    elevated: {
      backgroundColor: sharedSurfaceBackground,
      boxShadow: theme.palette.mode === 'dark' ? '0 18px 40px rgba(2, 6, 23, 0.36)' : designSystem.shadows.card,
      border: `1px solid ${borderColor}`,
    },
  };

  return {
    borderRadius: sharedSurfaceRadius,
    overflow: 'hidden',
    ...variants[variant],
  };
};

export const surfaceCardContentSx: AppSx = {
  p: { xs: 2.5, md: 3.5 },
};

export const infoPanelSx: AppSx = theme => ({
  p: 2.5,
  borderRadius: Math.max(4, designSystem.borderRadius.sm / 2),
  border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.2 : 0.08)}`,
  backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.1 : 0.04),
});

export const tintedPanelSx = (accent: 'primary' | 'secondary' | 'info' | 'warning' | 'error' = 'primary'): AppSx => theme => ({
  p: { xs: 2.5, md: 3 },
  borderRadius: Math.max(4, designSystem.borderRadius.sm / 2),
  border: `1px solid ${alpha(theme.palette[accent].main, theme.palette.mode === 'dark' ? 0.24 : 0.1)}`,
  backgroundColor: alpha(theme.palette[accent].main, theme.palette.mode === 'dark' ? 0.1 : 0.04),
});

export const orderedListSx: AppSx = {
  m: 0,
  pl: 2.5,
  display: 'grid',
  gap: 1,
};

export const formActionsRowSx: AppSx = {
  display: 'flex',
  gap: 1.5,
  justifyContent: 'flex-end',
  flexDirection: { xs: 'column-reverse', sm: 'row' },
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

export const tableHeadRowSx = (options?: { compact?: boolean }): AppSx => theme => ({
  backgroundColor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.035),
  boxShadow: 'none',
  borderBottom: `2px solid ${alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.18 : 0.1)}`,
  '& .MuiTableCell-head': {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    fontSize: options?.compact ? '0.8rem' : '0.95rem',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    border: 'none',
    padding: options?.compact ? '16px 12px' : '20px 16px',
    position: 'relative',
    backgroundColor: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.035),
  },
});

export const guestNameBadgeSx: AppSx = theme => ({
  display: 'inline-flex',
  alignItems: 'center',
  maxWidth: '100%',
  px: 1.25,
  py: 0.5,
  borderRadius: designSystem.borderRadius.pill,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
  color: theme.palette.common.white,
  fontWeight: 700,
  lineHeight: 1.2,
  boxShadow: 'none',
});

export const refreshActionButtonSx: AppSx = theme => ({
  fontWeight: 600,
  borderColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.light, 0.42)
    : theme.palette.secondary.main,
  color: theme.palette.mode === 'dark'
    ? theme.palette.common.white
    : theme.palette.secondary.main,
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.light, 0.22)
    : 'transparent',
  boxShadow: 'none',
  '&:hover': {
    borderColor: theme.palette.mode === 'dark'
      ? theme.palette.primary.light
      : theme.palette.secondary.main,
    color: theme.palette.mode === 'dark'
      ? theme.palette.common.white
      : theme.palette.secondary.main,
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.primary.light, 0.3)
      : alpha(theme.palette.secondary.main, 0.08),
    boxShadow: 'none',
  },
  '&:disabled': {
    borderColor: theme.palette.divider,
    color: theme.palette.text.disabled,
    backgroundColor: theme.palette.mode === 'dark'
      ? alpha(theme.palette.common.white, 0.04)
      : 'transparent',
  },
});

type ActionIconTone = 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const getActionIconToneColor = (theme: Theme, tone: ActionIconTone) => {
  switch (tone) {
    case 'accent':
      return getReadableAccentTextColor(theme);
    case 'neutral':
      return theme.palette.text.secondary;
    default:
      return getReadableAccentTextColor(theme, tone);
  }
};

export const actionIconButtonSx = (tone: ActionIconTone = 'neutral'): AppSx => theme => {
  const foreground = getActionIconToneColor(theme, tone);

  return {
    color: foreground,
    border: `1px solid ${alpha(foreground, theme.palette.mode === 'dark' ? 0.28 : 0.16)}`,
    backgroundColor: alpha(foreground, theme.palette.mode === 'dark' ? 0.14 : 0.06),
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    '&:hover': {
      color: foreground,
      borderColor: alpha(foreground, theme.palette.mode === 'dark' ? 0.42 : 0.24),
      backgroundColor: alpha(foreground, theme.palette.mode === 'dark' ? 0.22 : 0.12),
      transform: 'scale(1.08)',
    },
    '&.Mui-disabled': {
      color: theme.palette.text.disabled,
      borderColor: theme.palette.divider,
      backgroundColor: theme.palette.mode === 'dark'
        ? alpha(theme.palette.common.white, 0.04)
        : alpha(theme.palette.text.primary, 0.03),
    },
  };
};