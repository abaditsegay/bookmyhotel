/**
 * Shared premium styling helpers for shop tabs and tables.
 * Keep shop UI aligned with the brand colors and reduce inline style duplication.
 */
import { alpha, SxProps, Theme } from '@mui/material';
import { getThemeColorHelpers } from '../../theme/useThemeColors';

export const getPremiumTableHeadSx = (options?: { compact?: boolean }): SxProps<Theme> => {
  return (theme) => {
    const { COLORS, addAlpha } = getThemeColorHelpers(theme);
    const cellPadding = options?.compact ? '14px 12px' : '20px 16px';
    const isDark = theme.palette.mode === 'dark';
    const headerBackground = alpha(theme.palette.text.primary, isDark ? 0.08 : 0.035);
    const headerBorder = alpha(theme.palette.text.primary, isDark ? 0.18 : 0.1);

    return {
      backgroundColor: headerBackground,
      boxShadow: 'none',
      borderBottom: `2px solid ${headerBorder}`,
      '& .MuiTableCell-head': {
        color: theme.palette.text.secondary,
        fontWeight: 700,
        fontSize: options?.compact ? '0.9rem' : '0.95rem',
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        border: 'none',
        padding: cellPadding,
        position: 'relative',
        backgroundColor: headerBackground,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: isDark
            ? addAlpha(theme.palette.primary.light, 0.34)
            : addAlpha(COLORS.PRIMARY, 0.22),
        }
      }
    };
  };
};

export const premiumTabsPaperSx: SxProps<Theme> = (theme) => {
  const { addAlpha } = getThemeColorHelpers(theme);
  const isDark = theme.palette.mode === 'dark';

  return {
    mb: 3,
    backgroundColor: addAlpha(theme.palette.text.primary, isDark ? 0.04 : 0.02),
    border: `1px solid ${addAlpha(theme.palette.text.primary, isDark ? 0.14 : 0.08)}`,
    boxShadow: 'none',
    borderRadius: 2
  };
};

export const premiumTabsSx: SxProps<Theme> = (theme) => {
  const { COLORS, addAlpha } = getThemeColorHelpers(theme);

  return {
    px: 1,
    '& .MuiTab-root': {
      fontWeight: 600,
      fontSize: '0.95rem',
      textTransform: 'none',
      color: theme.palette.text.secondary,
      minHeight: 56,
      borderRadius: 1.5,
      transition: 'all 0.25s ease',
      '&:hover': {
        color: theme.palette.text.primary,
        backgroundColor: addAlpha(COLORS.PRIMARY, theme.palette.mode === 'dark' ? 0.14 : 0.06)
      },
      '&.Mui-selected': {
        color: theme.palette.text.primary,
        fontWeight: 700,
        backgroundColor: addAlpha(COLORS.PRIMARY, theme.palette.mode === 'dark' ? 0.18 : 0.08)
      }
    },
    '& .MuiTabs-indicator': {
      height: 3,
      backgroundColor: COLORS.SECONDARY,
      borderRadius: '3px 3px 0 0',
      boxShadow: 'none'
    }
  };
};
