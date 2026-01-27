/**
 * Shared premium styling helpers for shop tabs and tables.
 * Keep shop UI aligned with the brand colors and reduce inline style duplication.
 */
import { SxProps, Theme } from '@mui/material';
import { COLORS, addAlpha } from '../../theme/themeColors';

export const getPremiumTableHeadSx = (options?: { compact?: boolean }): SxProps<Theme> => {
  const cellPadding = options?.compact ? '14px 12px' : '20px 16px';

  return {
    background: `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.08)} 0%, ${addAlpha(COLORS.WHITE, 0.0)} 100%)`,
    boxShadow: `0 6px 12px ${addAlpha(COLORS.PRIMARY, 0.10)}`,
    '& .MuiTableCell-head': {
      color: COLORS.PRIMARY,
      fontWeight: 700,
      fontSize: options?.compact ? '0.9rem' : '0.95rem',
      letterSpacing: '0.4px',
      textTransform: 'uppercase',
      border: 'none',
      padding: cellPadding,
      position: 'relative',
      backgroundColor: addAlpha(COLORS.WHITE, 0.6),
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, ${addAlpha(COLORS.SECONDARY, 0.8)} 0%, ${addAlpha(COLORS.PRIMARY, 0.9)} 100%)`
      }
    }
  };
};

export const premiumTabsPaperSx: SxProps<Theme> = {
  mb: 3,
  background: `linear-gradient(135deg, ${addAlpha(COLORS.PRIMARY, 0.04)} 0%, ${addAlpha(COLORS.SECONDARY, 0.06)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${addAlpha(COLORS.PRIMARY, 0.08)}`,
  boxShadow: `0 6px 20px ${addAlpha(COLORS.PRIMARY, 0.12)}`,
  borderRadius: 2
};

export const premiumTabsSx: SxProps<Theme> = {
  px: 1,
  '& .MuiTab-root': {
    fontWeight: 600,
    fontSize: '0.95rem',
    textTransform: 'none',
    color: COLORS.SLATE_500,
    minHeight: 56,
    borderRadius: 1.5,
    transition: 'all 0.25s ease',
    '&:hover': {
      color: COLORS.PRIMARY,
      background: addAlpha(COLORS.PRIMARY, 0.06)
    },
    '&.Mui-selected': {
      color: COLORS.PRIMARY,
      fontWeight: 700,
      background: addAlpha(COLORS.PRIMARY, 0.08)
    }
  },
  '& .MuiTabs-indicator': {
    height: 3,
    background: `linear-gradient(90deg, ${COLORS.SECONDARY} 0%, ${COLORS.PRIMARY} 100%)`,
    borderRadius: '3px 3px 0 0',
    boxShadow: `0 -2px 10px ${addAlpha(COLORS.PRIMARY, 0.25)}`
  }
};
