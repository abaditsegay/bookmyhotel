import { alpha, Theme, useTheme } from '@mui/material/styles';
import { getSectionTint } from './surfaces';

type GradientType = 'primary' | 'secondary' | 'success' | 'slate' | 'purple' | 'white' | 'dark';

const getBackgroundLight = (theme: Theme) => {
  const background = theme.palette.background as Theme['palette']['background'] & { light?: string };

  return background.light ?? alpha(theme.palette.common.white, 0.92);
};

export const getThemeColorHelpers = (theme: Theme) => {
  const backgroundLight = getBackgroundLight(theme);
  const isDark = theme.palette.mode === 'dark';
  const slateBase = isDark ? '#94a3b8' : '#475569';

  const primaryGradient = `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`;
  const secondaryGradient = `linear-gradient(180deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.main} 100%)`;
  const successGradient = `linear-gradient(180deg, ${theme.palette.success.main} 0%, ${theme.palette.success.main} 100%)`;
  const darkGradient = `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`;
  const primaryText = theme.palette.text.primary;
  const secondaryText = theme.palette.text.secondary;
  const infoText = theme.palette.text.primary;
  const primarySoft = getSectionTint(theme, 'primary');
  const secondarySoft = getSectionTint(theme, 'secondary');
  const infoSoft = getSectionTint(theme, 'info');

  const COLORS = {
    PRIMARY: theme.palette.primary.main,
    PRIMARY_TEXT: primaryText,
    PRIMARY_HOVER: theme.palette.primary.dark,
    PRIMARY_PRESSED: theme.palette.primary.dark,
    SECONDARY: theme.palette.secondary.main,
    SECONDARY_TEXT: secondaryText,
    SECONDARY_HOVER: theme.palette.secondary.dark,
    BOOKED: theme.palette.info.main,
    PENDING: theme.palette.warning.main,
    SUCCESS: theme.palette.success.main,
    ERROR: theme.palette.error.main,
    CANCELLED: theme.palette.grey[500],
    CHECKED_IN: theme.palette.success.main,
    CHECKED_OUT: theme.palette.grey[600],
    AVAILABLE: theme.palette.success.main,
    OCCUPIED: theme.palette.warning.light,
    MAINTENANCE: theme.palette.error.main,
    CLEANING: theme.palette.warning.main,
    INPUT_FOCUS: theme.palette.primary.main,
    INPUT_HOVER: theme.palette.primary.dark,
    INPUT_BORDER: theme.palette.divider,
    INPUT_ERROR: theme.palette.error.main,
    CARD_BORDER: theme.palette.divider,
    CARD_HOVER: backgroundLight,
    WARNING: theme.palette.warning.main,
    INFO: theme.palette.info.main,
    WHITE: theme.palette.common.white,
    GOLD: theme.palette.secondary.main,
    TEXT_PRIMARY: theme.palette.text.primary,
    TEXT_SECONDARY: theme.palette.text.secondary,
    TEXT_DISABLED: theme.palette.text.disabled,
    BG_DEFAULT: theme.palette.background.default,
    BG_PAPER: theme.palette.background.paper,
    BG_LIGHT: backgroundLight,
    BG_PRIMARY_SOFT: primarySoft,
    BG_SECONDARY_SOFT: secondarySoft,
    BG_INFO_SOFT: infoSoft,
    BG_SLATE: slateBase,
      INFO_TEXT: infoText,
    MBIRR_ORANGE: theme.palette.secondary.main,
    TELEBIRR_GREEN: theme.palette.success.main,
    BG_SUCCESS_LIGHT: alpha(theme.palette.success.main, isDark ? 0.18 : 0.1),
    BG_WARNING_LIGHT: alpha(theme.palette.warning.main, isDark ? 0.18 : 0.12),
    BG_ERROR_LIGHT: alpha(theme.palette.error.main, isDark ? 0.18 : 0.1),
    BG_INFO_LIGHT: alpha(theme.palette.info.main, isDark ? 0.18 : 0.1),
    BG_DEFAULT_LIGHT: backgroundLight,
    SLATE_50: '#f8fafc',
    SLATE_400: '#94a3b8',
    SLATE_500: '#64748b',
    SLATE_600: '#475569',
    SLATE_700: '#334155',
    SLATE_800: '#1e293b',
    SLATE_900: '#0f172a',
    PURPLE_400: theme.palette.primary.light,
    PURPLE_500: theme.palette.primary.main,
    PURPLE_600: theme.palette.primary.dark,
    PURPLE_700: theme.palette.primary.dark,
    BORDER_LIGHT: theme.palette.divider,
    BORDER_DEFAULT: theme.palette.divider,
    DIVIDER: theme.palette.divider,
    BLACK: theme.palette.common.black,
    BLACK_ALPHA_87: alpha(theme.palette.common.black, 0.87),
    BLACK_ALPHA_60: alpha(theme.palette.common.black, 0.6),
    GRADIENT_PRIMARY: primaryGradient,
    GRADIENT_SECONDARY: secondaryGradient,
    GRADIENT_ACCENT: `linear-gradient(180deg, ${theme.palette.info.main} 0%, ${theme.palette.info.main} 100%)`,
    GRADIENT_WARM: `linear-gradient(180deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    GRADIENT_PURPLE: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`,
    GRADIENT_SLATE: `linear-gradient(180deg, ${theme.palette.background.light} 0%, ${theme.palette.background.light} 100%)`,
    GRADIENT_WHITE: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper} 100%)`,
    GRADIENT_DARK: darkGradient,
    GLASS_LIGHT: theme.palette.background.paper,
    GLASS_DARK: theme.palette.background.paper,
  } as const;

  const getGradient = (
    type: GradientType = 'primary',
    mode: 'light' | 'dark' = theme.palette.mode === 'dark' ? 'dark' : 'light'
  ): string => {
    if (type === 'slate') return COLORS.GRADIENT_SLATE;
    if (type === 'purple') return COLORS.GRADIENT_PURPLE;
    if (type === 'white') return COLORS.GRADIENT_WHITE;
    if (type === 'dark') return COLORS.GRADIENT_DARK;

    if (mode === 'dark') {
      switch (type) {
        case 'secondary':
          return `linear-gradient(180deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.main} 100%)`;
        case 'success':
          return `linear-gradient(180deg, ${theme.palette.success.main} 0%, ${theme.palette.success.main} 100%)`;
        default:
          return `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.main} 100%)`;
      }
    }

    switch (type) {
      case 'secondary':
        return secondaryGradient;
      case 'success':
        return successGradient;
      default:
        return primaryGradient;
    }
  };

  return {
    COLORS,
    addAlpha: alpha,
    getGradient,
  };
};

export const useThemeColors = () => {
  const theme = useTheme();

  return getThemeColorHelpers(theme);
};

export type ThemeColorsCompat = ReturnType<typeof getThemeColorHelpers>;