import { alpha, lighten, Theme } from '@mui/material/styles';

type AccentKey = 'primary' | 'secondary' | 'info' | 'warning' | 'error';

const getAccentColor = (theme: Theme, accent: AccentKey) => theme.palette[accent].main;

export const getReadableAccentTextColor = (theme: Theme, accent: AccentKey = 'primary') => {
  if (theme.palette.mode !== 'dark') {
    return theme.palette[accent].main;
  }

  const accentBase = theme.palette[accent].light ?? theme.palette[accent].main;

  switch (accent) {
    case 'primary':
      return lighten(accentBase, 0.42);
    case 'secondary':
      return lighten(accentBase, 0.08);
    case 'warning':
    case 'error':
      return lighten(accentBase, 0.18);
    case 'info':
      return lighten(accentBase, 0.24);
    default:
      return lighten(accentBase, 0.2);
  }
};

export const getPageShellBackground = (theme: Theme) => {
  if (theme.palette.mode === 'dark') {
    return `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${theme.palette.background.default} 38%, ${theme.palette.background.dark} 100%)`;
  }

  return `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${theme.palette.background.default} 42%, ${theme.palette.background.paper} 100%)`;
};

export const getSectionTint = (theme: Theme, accent: AccentKey = 'primary') => {
  const baseColor = getAccentColor(theme, accent);
  const opacity = theme.palette.mode === 'dark' ? 0.14 : 0.05;

  return alpha(baseColor, opacity);
};

export const getInsetSurfaceBackground = (theme: Theme, accent: AccentKey = 'primary') => {
  const baseColor = getAccentColor(theme, accent);

  if (theme.palette.mode === 'dark') {
    return `linear-gradient(180deg, ${alpha(baseColor, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.96)} 100%)`;
  }

  return `linear-gradient(180deg, ${alpha(baseColor, 0.04)} 0%, ${theme.palette.background.paper} 100%)`;
};

export const getElevatedCardShadow = (theme: Theme) => {
  return theme.palette.mode === 'dark'
    ? `0 18px 48px ${alpha(theme.palette.common.black, 0.42)}`
    : `0 18px 48px ${alpha(theme.palette.primary.main, 0.12)}`;
};